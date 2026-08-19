export type VoiceOption = {
  id: string;
  name: string;
  quality: string;
};

/** Voices chosen for a philosopher-emperor — grave, warm, or imperial. */
export const VOICES: VoiceOption[] = [
  { id: "lux", name: "Lux", quality: "Grounded and quietly wise — the private notebook" },
  { id: "orion", name: "Orion", quality: "Rich, cinematic — the page read aloud" },
  { id: "leo", name: "Leo", quality: "Authoritative — the emperor at the camp table" },
  { id: "naksh", name: "Naksh", quality: "Warm and thoughtful — a teacher of philosophy" },
  { id: "altair", name: "Altair", quality: "Refined, even, imperial" },
  { id: "perseus", name: "Perseus", quality: "Steady and trustworthy" },
  { id: "atlas", name: "Atlas", quality: "Commanding, a little severe" },
  { id: "aurora", name: "Aurora", quality: "Serene and unhurried" },
  { id: "sal", name: "Sal", quality: "Smooth, balanced counsel" },
  { id: "rigel", name: "Rigel", quality: "Precise, without ornament" },
];

export const DEFAULT_VOICE = "lux";

export const VOICE_SAMPLE =
  "You have power over your mind, not outside events. Realize this, and you will find strength.";

export function isKnownVoice(id: string): boolean {
  return VOICES.some((v) => v.id === id);
}
