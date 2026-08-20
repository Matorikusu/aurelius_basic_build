export type VoiceOption = {
  id: string;
  name: string;
  quality: string;
};

export const VOICES: VoiceOption[] = [
  { id: "lux", name: "Lux", quality: "British, grave — a private notebook" },
  { id: "orion", name: "Orion", quality: "Low and cinematic" },
  { id: "altair", name: "Altair", quality: "Refined, even, imperial" },
  { id: "perseus", name: "Perseus", quality: "Steady American counsel" },
];

export const DEFAULT_VOICE = "lux";

export const VOICE_SAMPLE =
  "You have power over your mind, not outside events. Realize this, and you will find strength.";

export function sanitizeVoice(id: string | undefined | null): string {
  return id && VOICES.some((v) => v.id === id) ? id : DEFAULT_VOICE;
}
