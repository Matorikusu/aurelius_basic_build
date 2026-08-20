export type VoiceOption = {
  id: string;
  name: string;
  quality: string;
};

export const VOICES: VoiceOption[] = [
  { id: "lux", name: "Lux", quality: "Grounded and quietly wise" },
  { id: "orion", name: "Orion", quality: "Rich, cinematic" },
  { id: "altair", name: "Altair", quality: "Refined, even, imperial" },
  { id: "perseus", name: "Perseus", quality: "Steady and trustworthy" },
];

export const DEFAULT_VOICE = "lux";

export const VOICE_SAMPLE =
  "You have power over your mind, not outside events. Realize this, and you will find strength.";

export function isKnownVoice(id: string): boolean {
  return VOICES.some((v) => v.id === id);
}

export function sanitizeVoice(id: string | undefined | null): string {
  return id && isKnownVoice(id) ? id : DEFAULT_VOICE;
}
