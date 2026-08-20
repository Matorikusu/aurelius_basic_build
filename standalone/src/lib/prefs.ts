import { DEFAULT_MANNER, type Manner } from "./types";
import { DEFAULT_VOICE, sanitizeVoice } from "./voices";

export type VoiceEngine = "xai" | "browser";

export type Prefs = {
  apiKey: string;
  proxyUrl: string;
  model: string;
  voiceId: string;
  voiceEngine: VoiceEngine;
  autoSpeak: boolean;
  manner: Manner;
};

const KEY = "aurelius.local.prefs";

export const DEFAULT_PREFS: Prefs = {
  apiKey: "",
  proxyUrl: "",
  model: "grok-4.5",
  voiceId: DEFAULT_VOICE,
  voiceEngine: "xai",
  autoSpeak: false,
  manner: DEFAULT_MANNER,
};

export function loadPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<Prefs> | null;
    if (!raw) return { ...DEFAULT_PREFS };
    return {
      apiKey: typeof raw.apiKey === "string" ? raw.apiKey : "",
      proxyUrl: typeof raw.proxyUrl === "string" ? raw.proxyUrl : "",
      model: typeof raw.model === "string" && raw.model.trim() ? raw.model : "grok-4.5",
      voiceId: sanitizeVoice(raw.voiceId),
      voiceEngine: raw.voiceEngine === "browser" ? "browser" : "xai",
      autoSpeak: Boolean(raw.autoSpeak),
      manner: {
        register:
          raw.manner?.register === "journal" || raw.manner?.register === "emperor"
            ? raw.manner.register
            : "counsel",
        austerity: Number.isFinite(Number(raw.manner?.austerity))
          ? clamp(Number(raw.manner?.austerity), 0, 100)
          : DEFAULT_MANNER.austerity,
        brevity: Number.isFinite(Number(raw.manner?.brevity))
          ? clamp(Number(raw.manner?.brevity), 0, 100)
          : DEFAULT_MANNER.brevity,
      },
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
