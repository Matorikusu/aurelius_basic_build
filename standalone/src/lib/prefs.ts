import { DEFAULT_MANNER, type Manner } from "./types";
import { DEFAULT_VOICE, sanitizeVoice } from "./voices";
import { isModelId, MODELS, type ModelId } from "./engine";

export type Prefs = {
  modelId: ModelId;
  voiceId: string;
  autoSpeak: boolean;
  manner: Manner;
};

const KEY = "aurelius.local.prefs";

export const DEFAULT_PREFS: Prefs = {
  modelId: MODELS[0].id,
  voiceId: DEFAULT_VOICE,
  autoSpeak: true,
  manner: DEFAULT_MANNER,
};

export function loadPrefs(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<Prefs> | null;
    if (!raw) return { ...DEFAULT_PREFS };
    return {
      modelId: raw.modelId && isModelId(raw.modelId) ? raw.modelId : DEFAULT_PREFS.modelId,
      voiceId: sanitizeVoice(raw.voiceId),
      autoSpeak: raw.autoSpeak === false ? false : true,
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
