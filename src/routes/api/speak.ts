import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_VOICE, isKnownVoice } from "@/lib/marcus/voices";

export const Route = createFileRoute("/api/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "The voice is unavailable." }, { status: 503 });
        }

        let body: { text?: string; voice_id?: string };
        try {
          body = (await request.json()) as { text?: string; voice_id?: string };
        } catch {
          return Response.json({ error: "Nothing to speak." }, { status: 400 });
        }

        const text = (body.text ?? "").replace(/\s+/g, " ").trim().slice(0, 1200);
        if (!text) return Response.json({ error: "Nothing to speak." }, { status: 400 });
        const voice_id = isKnownVoice(body.voice_id ?? "") ? body.voice_id! : DEFAULT_VOICE;

        const upstream = await fetch("https://api.x.ai/v1/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ text, voice_id, language: "en" }),
        });

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          console.error("[speak] xAI error", upstream.status, errText.slice(0, 400));
          return Response.json({ error: "The voice could not be formed." }, { status: 502 });
        }

        const audio = await upstream.arrayBuffer();
        const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";
        return new Response(audio, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
