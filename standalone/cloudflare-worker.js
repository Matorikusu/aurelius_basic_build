/**
 * Free CORS proxy for GitHub Pages.
 * Deploy at https://dash.cloudflare.com → Workers → Create.
 * The visitor's xAI key is sent as Authorization and is never stored here.
 */
const GREETING =
  "You have found me at my papers. Sit, if you wish. Speak of what disturbs the mind — or of whatever you came to say.";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}

function keyFrom(request) {
  const header = request.headers.get("Authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/health") {
      return json(200, { ok: true, hasKey: false, proxy: true });
    }

    const apiKey = keyFrom(request);
    if (!apiKey) return json(401, { error: "Add an xAI API key in Settings." });

    if (path === "/api/chat" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { error: "Nothing was said." });
      }
      const raw = Array.isArray(body.messages) ? body.messages : [];
      const messages = [];
      for (const m of raw.slice(-24)) {
        if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
        const content = m.content.trim().slice(0, 4000);
        if (content) messages.push({ role: m.role, content });
      }
      if (!messages.some((m) => m.role === "user")) {
        return json(400, { error: "Speak first, then I will answer." });
      }
      const system = typeof body.system === "string" ? body.system : "";
      const max_tokens = Math.min(800, Math.max(120, Number(body.max_tokens) || 380));
      const model = typeof body.model === "string" && body.model.trim() ? body.model : "grok-4.5";
      const payload = [];
      if (system) payload.push({ role: "system", content: system });
      payload.push({ role: "assistant", content: GREETING });
      payload.push(...messages);

      const upstream = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: 0.75,
          max_tokens,
          messages: payload,
        }),
      });

      if (!upstream.ok || !upstream.body) {
        return json(502, { error: "Marcus could not be reached." });
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = upstream.body.getReader();
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
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
                } catch {
                  /* ignore */
                }
              }
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          ...corsHeaders(),
        },
      });
    }

    if (path === "/api/speak" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { error: "Nothing to speak." });
      }
      const text = String(body.text ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1200);
      if (!text) return json(400, { error: "Nothing to speak." });
      const allowed = new Set(["lux", "orion", "altair", "perseus"]);
      const voice_id = allowed.has(body.voice_id) ? body.voice_id : "lux";

      const upstream = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ text, voice_id, language: "en" }),
      });
      if (!upstream.ok) return json(502, { error: "The voice could not be formed." });
      return new Response(upstream.body, {
        headers: {
          "Content-Type": upstream.headers.get("Content-Type") || "audio/mpeg",
          "Cache-Control": "no-store",
          ...corsHeaders(),
        },
      });
    }

    return json(404, { error: "Not found." });
  },
};
