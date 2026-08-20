import { createFileRoute } from "@tanstack/react-router";
import { buildSystemPrompt, maxTokensFor, sanitizeManner } from "@/lib/marcus/prompt";
import { GREETING } from "@/lib/marcus/types";

type Incoming = { role: string; content: string };

function pickOllamaModel(names: string[]): string | null {
  if (!names.length) return null;
  const preferred = ["llama3.2", "llama3.2:3b", "llama3.1", "phi4", "phi3", "qwen2.5", "mistral"];
  for (const want of preferred) {
    const hit = names.find((n) => n === want || n.startsWith(`${want}:`) || n.replace(/:latest$/, "") === want);
    if (hit) return hit;
  }
  return names[0];
}

async function chatOllama(request: Request): Promise<Response | null> {
  let body: { messages?: Incoming[]; manner?: unknown };
  try {
    body = (await request.json()) as { messages?: Incoming[]; manner?: unknown };
  } catch {
    return Response.json({ error: "Nothing was said." }, { status: 400 });
  }

  let model: string | null = null;
  try {
    const tags = await fetch("http://127.0.0.1:11434/api/tags");
    if (!tags.ok) return null;
    const data = (await tags.json()) as { models?: { name: string }[] };
    model = pickOllamaModel((data.models || []).map((m) => m.name));
  } catch {
    return null;
  }
  if (!model) {
    return Response.json(
      { error: "Ollama is open but has no model. Run: ollama pull llama3.2" },
      { status: 503 },
    );
  }

  const manner = sanitizeManner(body.manner);
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: buildSystemPrompt(manner) },
  ];
  for (const m of raw.slice(-24)) {
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
    const content = m.content.trim().slice(0, 4000);
    if (content) messages.push({ role: m.role, content });
  }
  if (!messages.some((m) => m.role === "user")) {
    return Response.json({ error: "Speak first, then I will answer." }, { status: 400 });
  }

  const upstream = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { temperature: 0.75, num_predict: maxTokensFor(manner) },
    }),
  });
  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    return Response.json(
      { error: errText.slice(0, 240) || "Ollama did not answer." },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const json = JSON.parse(trimmed) as { message?: { content?: string } };
              const delta = json.message?.content;
              if (delta) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            } catch {
              /* skip */
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          const ollama = await chatOllama(request);
          if (ollama) return ollama;
          return Response.json(
            {
              error:
                "No xAI key and Ollama is not running. For a free local copy, install Ollama from ollama.com and run: ollama pull llama3.2",
            },
            { status: 503 },
          );
        }

        let body: { messages?: Incoming[]; manner?: unknown };
        try {
          body = (await request.json()) as { messages?: Incoming[]; manner?: unknown };
        } catch {
          return Response.json({ error: "Nothing was said." }, { status: 400 });
        }

        const manner = sanitizeManner(body.manner);
        const raw = Array.isArray(body.messages) ? body.messages : [];
        const messages: { role: "user" | "assistant"; content: string }[] = [];
        for (const m of raw.slice(-24)) {
          if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
          const content = m.content.trim().slice(0, 4000);
          if (!content) continue;
          messages.push({ role: m.role, content });
        }
        if (!messages.some((m) => m.role === "user")) {
          return Response.json({ error: "Speak first, then I will answer." }, { status: 400 });
        }

        const system = buildSystemPrompt(manner);
        const payload = [
          { role: "system" as const, content: system },
          { role: "assistant" as const, content: GREETING },
          ...messages,
        ];

        const upstream = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4.5",
            stream: true,
            temperature: 0.75,
            max_tokens: maxTokensFor(manner),
            messages: payload,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          console.error("[chat] xAI error", upstream.status, errText.slice(0, 400));
          return Response.json({ error: "Marcus could not be reached." }, { status: 502 });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = upstream.body.getReader();

        const stream = new ReadableStream({
          async start(controller) {
            let buf = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const data = trimmed.slice(5).trim();
                  if (data === "[DONE]") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    continue;
                  }
                  try {
                    const json = JSON.parse(data) as {
                      choices?: { delta?: { content?: string } }[];
                    };
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`),
                      );
                    }
                  } catch {
                    /* ignore partial json */
                  }
                }
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : "stream failed";
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
