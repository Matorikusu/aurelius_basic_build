export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

export type Register = "journal" | "counsel" | "emperor";

export type Manner = {
  register: Register;
  /** 0 = gentle, 100 = austere */
  austerity: number;
  /** 0 = expansive, 100 = aphoristic */
  brevity: number;
};

export const DEFAULT_MANNER: Manner = {
  register: "counsel",
  austerity: 58,
  brevity: 62,
};

export const GREETING =
  "You have found me at my papers. Sit, if you wish. Speak of what disturbs the mind — or of whatever you came to say.";
