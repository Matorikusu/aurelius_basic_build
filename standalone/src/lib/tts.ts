import { stopAudio as stopBrowser } from "./audio";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

export const KOKORO_VOICES: Record<string, string> = {
  lux: "bm_george",
  orion: "am_fenrir",
  altair: "bm_lewis",
  perseus: "am_michael",
};

type RawAudio = {
  audio?: Float32Array;
  sampling_rate?: number;
  toBlob?: () => Blob;
};

type Kokoro = {
  generate: (text: string, opts: { voice: string }) => Promise<RawAudio>;
};

let tts: Kokoro | null = null;
let inflight: Promise<Kokoro> | null = null;
let current: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let stopFlag = false;

export function stopNeural() {
  stopFlag = true;
  if (current) {
    current.pause();
    current.onended = null;
    current.onerror = null;
    current.src = "";
    current = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  stopBrowser();
}

export async function ensureTTS(onProgress?: (text: string) => void): Promise<Kokoro> {
  if (tts) return tts;
  if (inflight) return inflight;
  inflight = (async () => {
    onProgress?.("Tuning his voice… a small neural voice, once.");
    const { KokoroTTS } = await import("kokoro-js");
    const created = (await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (p: { status?: string; progress?: number }) => {
        const pct = Math.round((p.progress || 0) * 100);
        if (pct > 0) onProgress?.(`Tuning his voice · ${pct}%`);
        else if (p.status) onProgress?.(p.status);
      },
    })) as Kokoro;
    tts = created;
    onProgress?.("Voice is ready.");
    return created;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

function chunkText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > 380 && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else buf += s;
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.filter(Boolean);
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const n = samples.length;
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, n * 2, true);
  let offset = 44;
  for (let i = 0; i < n; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function toBlob(raw: RawAudio): Blob {
  if (typeof raw.toBlob === "function") return raw.toBlob();
  if (raw.audio) return encodeWav(raw.audio, raw.sampling_rate || 24000);
  throw new Error("The voice returned no sound.");
}

function playBlob(blob: Blob): Promise<void> {
  stopFlag = false;
  if (current) {
    current.pause();
    current.src = "";
  }
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  const url = URL.createObjectURL(blob);
  objectUrl = url;
  const audio = new Audio(url);
  current = audio;
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("The voice faltered."));
    void audio.play().catch((err: unknown) => {
      reject(err instanceof Error ? err : new Error("Could not play."));
    });
  });
}

export async function speakNeural(text: string, voiceId: string, onProgress?: (t: string) => void): Promise<void> {
  const engine = await ensureTTS(onProgress);
  const voice = KOKORO_VOICES[voiceId] ?? KOKORO_VOICES.lux;
  stopNeural();
  stopFlag = false;
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    if (stopFlag) return;
    const raw = await engine.generate(chunk, { voice });
    if (stopFlag) return;
    await playBlob(toBlob(raw));
  }
}
