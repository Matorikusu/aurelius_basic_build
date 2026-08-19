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

export const SUGGESTIONS: { label: string; text: string }[] = [
  {
    label: "What is in my power?",
    text: "I wake already anxious about things I cannot change. What, truly, is in my power today?",
  },
  {
    label: "Anger I cannot avoid",
    text: "I am angry with someone I cannot avoid. How should I meet them without becoming worse myself?",
  },
  {
    label: "Fear of dying",
    text: "I am afraid of dying. Speak to me as you would to yourself.",
  },
  {
    label: "I am wasting my life",
    text: "I feel I am wasting the life I have been given. How do I begin again, without drama?",
  },
];
