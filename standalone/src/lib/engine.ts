import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import { buildSystemPrompt, maxTokensFor } from "./prompt";
import { GREETING, type ChatMessage, type Manner } from "./types";

export const MODELS = [
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Steady",
    hint: "Better counsel · about 2 GB, once",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Swift",
    hint: "Lighter · about 1 GB, once",
  },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export function isModelId(id: string): id is ModelId {
  return MODELS.some((m) => m.id === id);
}

type Progress = { progress: number; text: string };

let engine: MLCEngineInterface | null = null;
let loadedId: string | null = null;
let inflight: Promise<MLCEngineInterface> | null = null;

export function webgpuAvailable() {
  return typeof navigator !== "undefined" && Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
}

export async function ensureEngine(
  modelId: string,
  onProgress: (p: Progress) => void,
): Promise<MLCEngineInterface> {
  if (engine && loadedId === modelId) return engine;
  if (inflight) return inflight;

  inflight = (async () => {
    if (!webgpuAvailable()) {
      throw new Error("This browser cannot run him on-device. Use Chrome or Edge on a computer.");
    }
    const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
    if (engine) {
      await engine.unload().catch(() => {});
      engine = null;
      loadedId = null;
    }
    const created = await CreateMLCEngine(modelId, {
      initProgressCallback: (r) => {
        onProgress({ progress: r.progress, text: r.text });
      },
    });
    engine = created;
    loadedId = modelId;
    return created;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function interruptCounsel() {
  try {
    engine?.interruptGenerate();
  } catch {
    /* ignore */
  }
}

export async function streamCounsel(opts: {
  messages: ChatMessage[];
  manner: Manner;
  modelId: string;
  onProgress: (p: Progress) => void;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const eng = await ensureEngine(opts.modelId, opts.onProgress);
  if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const onAbort = () => interruptCounsel();
  opts.signal?.addEventListener("abort", onAbort, { once: true });

  const payload = [
    { role: "system" as const, content: buildSystemPrompt(opts.manner) },
    { role: "assistant" as const, content: GREETING },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const stream = await eng.chat.completions.create({
      messages: payload,
      stream: true,
      temperature: 0.75,
      max_tokens: maxTokensFor(opts.manner),
    });
    let full = "";
    for await (const chunk of stream) {
      if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        opts.onDelta(delta);
      }
    }
    return full;
  } finally {
    opts.signal?.removeEventListener("abort", onAbort);
  }
}
