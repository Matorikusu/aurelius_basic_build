import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MANNER, type Manner, type Register } from "@/lib/marcus/types";
import { DEFAULT_VOICE } from "@/lib/marcus/voices";

type PrefsState = {
  voiceId: string;
  manner: Manner;
  autoSpeak: boolean;
  setVoice: (voiceId: string) => void;
  setRegister: (register: Register) => void;
  setAusterity: (austerity: number) => void;
  setBrevity: (brevity: number) => void;
  setAutoSpeak: (autoSpeak: boolean) => void;
  hydrate: (p: { voiceId: string; manner: Manner; autoSpeak: boolean }) => void;
};

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      voiceId: DEFAULT_VOICE,
      manner: DEFAULT_MANNER,
      autoSpeak: false,
      setVoice: (voiceId) => set({ voiceId }),
      setRegister: (register) => set((s) => ({ manner: { ...s.manner, register } })),
      setAusterity: (austerity) => set((s) => ({ manner: { ...s.manner, austerity } })),
      setBrevity: (brevity) => set((s) => ({ manner: { ...s.manner, brevity } })),
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
      hydrate: (p) => set({ voiceId: p.voiceId, manner: p.manner, autoSpeak: p.autoSpeak }),
    }),
    { name: "aurelius.prefs" },
  ),
);
