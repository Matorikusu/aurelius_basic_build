import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "Hearing is unavailable." }, { status: 503 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "No recording arrived." }, { status: 400 });
        }
        const file = form.get("file");
        if (!(file instanceof File) || file.size < 200) {
          return Response.json({ error: "The recording was empty." }, { status: 400 });
        }
        if (file.size > 4_000_000) {
          return Response.json({ error: "That was too long to hear at once." }, { status: 400 });
        }

        const out = new FormData();
        out.append("file", file, file.name || "speech.webm");

        const upstream = await fetch("https://api.x.ai/v1/stt", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: out,
        });

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          console.error("[stt] xAI error", upstream.status, errText.slice(0, 400));
          return Response.json({ error: "I could not hear that." }, { status: 502 });
        }

        const json = (await upstream.json()) as { text?: string };
        return Response.json({ text: (json.text ?? "").trim() });
      },
    },
  },
});
