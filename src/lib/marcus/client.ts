import type { ChatMessage, Manner } from "./types";

export async function streamCounsel(opts: {
  messages: ChatMessage[];
  manner: Manner;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      manner: opts.manner,
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The counsel could not be reached.");
  }
  if (!res.body) throw new Error("The counsel returned no voice.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as { delta?: string; error?: string };
        if (json.error) throw new Error(json.error);
        if (json.delta) {
          full += json.delta;
          opts.onDelta(json.delta);
        }
      } catch (err) {
        if (err instanceof SyntaxError) continue;
        throw err;
      }
    }
  }
  return full;
}

export async function speakText(text: string, voiceId: string, signal?: AbortSignal): Promise<Blob> {
  const res = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId }),
    signal,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The voice could not be formed.");
  }
  return res.blob();
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const file = new File([blob], "speech.webm", { type: blob.type || "audio/webm" });
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "I could not hear that.");
  }
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}
