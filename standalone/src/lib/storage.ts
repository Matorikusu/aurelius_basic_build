import type { Conversation } from "./types";

const LIST_KEY = "aurelius.local.conversations";
const ACTIVE_KEY = "aurelius.local.active";

export function loadConversations(): Conversation[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LIST_KEY) || "[]") as Conversation[];
    if (!Array.isArray(raw)) return [];
    return raw.filter((c) => c && typeof c.id === "string" && Array.isArray(c.messages));
  } catch {
    return [];
  }
}

export function saveConversations(list: Conversation[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list.slice(0, 40)));
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}
