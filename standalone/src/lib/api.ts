import { buildSystemPrompt, maxTokensFor } from "./prompt";
import type { ChatMessage, Manner } from "./types";

const OLLAMA = "http://127.0.0.1:11434";

export type Health = {
  ok: boolean;
  backend: "ollama" | "ollama-empty" | "none";
  ollama: boolean;
  model: string | null;
  models: string[];
  hint: string;
  via?: "proxy" | "direct";
};

const EMPTY: Health = {
  ok: false,
  backend: "none",
  ollama: false,
  model: null,
  models: [],
  hint: "Ollama is not running. Install the free app from ollama.com, then run: ollama pull llama3.2",
};

function pickModel(names: string[]): string | null {
  if (!names.length) return null;
  const preferred = ["llama3.2", "llama3.2:3b", "llama3.1", "phi4", "phi3", "qwen2.5", "mistral", "gemma2"];
  for (const want of preferred) {
    const hit = names.find((n) => n === want || n.startsWith(`${want}:`) || n.replace(/:latest$/, "") === want);
    if (hit) return hit;
  }
  return names[0];
}

async function fromTags(models: string[], via: "proxy" | "direct"): Promise<Health> {
  const model = pickModel(models);
  if (model) {
    return {
      ok: true,
      backend: "ollama",
      ollama: true,
      model,
      models,
      via,
      hint: `Using ${model} on this computer.`,
    };
  }
  return {
    ok: true,
    backend: "ollama-empty",
    ollama: true,
    model: null,
    models,
    via,
    hint: "Ollama is open, but no model is installed. In a terminal: ollama pull llama3.2",
  };
}

async function probeDirect(): Promise<Health> {
  try {
    const res = await fetch(`${OLLAMA}/api/tags`, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    const data = (await res.json()) as { models?: { name: string }[] };
    const models = (data.models || []).map((m) => m.name).filter(Boolean);
    return fromTags(models, "direct");
  } catch {
    return EMPTY;
  }
}

export async function probeHealth(): Promise<Health> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (res.ok) {
      const h = (await res.json()) as Health;
      if (h.ollama && h.model) return { ...h, via: "proxy" };
      if (h.ollama) return { ...h, via: "proxy" };
    }
  } catch {
    /* try talking to Ollama ourselves */
  }
  return probeDirect();
}

async function streamNdjson(
  res: Response,
  onDelta: (text: string) => void,
): Promise<string> {
  if (!res.body) throw new Error("Ollama returned no voice.");
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
      if (!trimmed) continue;
      const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          delta?: string;
          error?: string;
          message?: { content?: string };
        };
        if (json.error) throw new Error(json.error);
        const delta = json.delta ?? json.message?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch (err) {
        if (err instanceof SyntaxError) continue;
        throw err;
      }
    }
  }
  return full;
}

async function streamViaProxy(opts: {
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
      system: buildSystemPrompt(opts.manner),
      max_tokens: maxTokensFor(opts.manner),
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Ollama did not answer.");
  }
  return streamNdjson(res, opts.onDelta);
}

async function streamDirect(opts: {
  messages: ChatMessage[];
  manner: Manner;
  model: string;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const payload = [
    { role: "system", content: buildSystemPrompt(opts.manner) },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      messages: payload,
      stream: true,
      options: { temperature: 0.75, num_predict: maxTokensFor(opts.manner) },
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body.slice(0, 240) || `Ollama returned ${res.status}.`);
  }
  return streamNdjson(res, opts.onDelta);
}

export async function streamOllama(opts: {
  messages: ChatMessage[];
  manner: Manner;
  model?: string | null;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  try {
    return await streamViaProxy(opts);
  } catch (err) {
    const model = opts.model;
    if (!model) throw err;
    try {
      return await streamDirect({ ...opts, model });
    } catch {
      throw err;
    }
  }
}
