import { Drawer } from "vaul";
import { History, SlidersHorizontal, Trash2, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthChip } from "@/components/chamber/auth-chip";
import { Composer } from "@/components/chamber/composer";
import { IdentityBlock, Portrait } from "@/components/chamber/portrait-rail";
import { Thread } from "@/components/chamber/thread";
import { VoiceManner } from "@/components/chamber/voice-manner";
import { Button } from "@/components/ui/button";
import { playBlob, stopAudio } from "@/lib/audio";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import {
  deleteConversation,
  listConversations,
  loadConversation,
  loadPrefs,
  savePrefs,
  saveTurn,
  type ConversationSummary,
} from "@/lib/conversations";
import { speakText, streamCounsel, transcribeAudio } from "@/lib/marcus/client";
import { VOICE_SAMPLE } from "@/lib/marcus/voices";
import type { ChatMessage } from "@/lib/marcus/types";
import { usePrefs } from "@/lib/prefs-store";
import { uid } from "@/lib/utils";

export function Chamber() {
  const user = useCurrentUser();
  const manner = usePrefs((s) => s.manner);
  const voiceId = usePrefs((s) => s.voiceId);
  const autoSpeak = usePrefs((s) => s.autoSpeak);
  const hydrate = usePrefs((s) => s.hydrate);

  const [conversationId, setConversationId] = useState(() => uid());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ConversationSummary[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prefsLoaded = useRef(false);

  const scrollToEnd = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, streaming, scrollToEnd]);

  useEffect(() => {
    if (!user || prefsLoaded.current) return;
    prefsLoaded.current = true;
    void loadPrefs()
      .then((p) => {
        if (p) hydrate(p);
      })
      .catch(() => {
        /* guest or unauthorized */
      });
    void listConversations()
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [user, hydrate]);

  useEffect(() => {
    if (!user) return;
    const t = window.setTimeout(() => {
      void savePrefs({ data: { voiceId, manner, autoSpeak } }).catch(() => {});
    }, 900);
    return () => window.clearTimeout(t);
  }, [user, voiceId, manner, autoSpeak]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopAudio();
      recRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const speak = useCallback(
    async (id: string, text: string, voice = voiceId) => {
      if (!text.trim()) return;
      stopAudio();
      setSpeakingId(id);
      try {
        const blob = await speakText(text, voice);
        await playBlob(blob);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "The voice faltered.";
        if (!/abort/i.test(msg)) toast.error(msg);
      } finally {
        setSpeakingId((cur) => (cur === id ? null : cur));
      }
    },
    [voiceId],
  );

  const stopSpeak = useCallback(() => {
    stopAudio();
    setSpeakingId(null);
    setPreviewingId(null);
  }, []);

  const previewVoice = useCallback(async (id: string) => {
    stopAudio();
    setPreviewingId(id);
    setSpeakingId("preview");
    try {
      const blob = await speakText(VOICE_SAMPLE, id);
      await playBlob(blob);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The voice faltered.");
    } finally {
      setPreviewingId(null);
      setSpeakingId((cur) => (cur === "preview" ? null : cur));
    }
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.replace(/\s+/g, " ").trim();
      if (!content || streaming) return;
      stopSpeak();
      setDraft("");
      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: "" };
      const prior = messages;
      setMessages([...prior, userMsg, assistantMsg]);
      setStreaming(true);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const full = await streamCounsel({
          messages: [...prior, userMsg],
          manner,
          signal: ac.signal,
          onDelta: (delta) => {
            setMessages((cur) =>
              cur.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m)),
            );
          },
        });
        const finalText = full.trim();
        setMessages((cur) =>
          cur.map((m) => (m.id === assistantMsg.id ? { ...m, content: finalText || m.content } : m)),
        );
        if (user) {
          void saveTurn({
            data: {
              conversationId,
              titleSource: userMsg.content,
              manner,
              voiceId,
              userMessage: userMsg,
              assistantMessage: { ...assistantMsg, content: finalText },
            },
          })
            .then(() => listConversations().then(setHistory).catch(() => {}))
            .catch(() => {});
        }
        if (autoSpeak && finalText) {
          void speak(assistantMsg.id, finalText);
        }
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Marcus could not be reached.";
        toast.error(msg);
        setMessages((cur) =>
          cur.map((m) =>
            m.id === assistantMsg.id && !m.content
              ? { ...m, content: "I am silent a moment. Try again when the line is clear." }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [streaming, messages, manner, user, conversationId, voiceId, autoSpeak, speak, stopSpeak],
  );

  function newConversation() {
    abortRef.current?.abort();
    stopSpeak();
    setConversationId(uid());
    setMessages([]);
    setDraft("");
    setStreaming(false);
    setHistoryOpen(false);
  }

  async function openConversation(id: string) {
    try {
      const loaded = await loadConversation({ data: id });
      if (!loaded) return;
      abortRef.current?.abort();
      stopSpeak();
      setConversationId(loaded.id);
      setMessages(loaded.messages);
      hydrate({ voiceId: loaded.voiceId, manner: loaded.manner, autoSpeak });
      setHistoryOpen(false);
    } catch {
      toast.error("That conversation could not be opened.");
    }
  }

  async function removeConversation(id: string) {
    try {
      await deleteConversation({ data: id });
      setHistory((h) => h.filter((c) => c.id !== id));
      if (id === conversationId) newConversation();
    } catch {
      toast.error("Could not put that paper away.");
    }
  }

  async function toggleMic() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("This chamber cannot hear you here.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recRef.current = null;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size < 400) return;
        void transcribeAudio(blob)
          .then((text) => {
            if (text) setDraft((d) => (d ? `${d} ${text}` : text));
            else toast.message("I heard nothing I could write.");
          })
          .catch((err: unknown) => {
            toast.error(err instanceof Error ? err.message : "I could not hear that.");
          });
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error("The microphone was refused.");
    }
  }

  const speaking = speakingId !== null;

  return (
    <div className="relative min-h-dvh bg-ink text-parchment">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url(/chamber.jpg)" }}
      />
      <div className="chamber-veil pointer-events-none absolute inset-0" />
      <div className="grain absolute inset-0 opacity-40" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-gold/15 lg:flex">
          <div className="p-5">
            <Portrait speaking={speaking} />
            <IdentityBlock />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            <VoiceManner onPreviewVoice={(id) => void previewVoice(id)} previewingId={previewingId} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <div className="lg:hidden">
              <Portrait speaking={speaking} compact />
            </div>
            <div className="min-w-0 flex-1 lg:hidden">
              <p className="font-display text-xs tracking-widest text-gold uppercase">Aurelius</p>
              <p className="truncate font-serif text-sm text-parchment">Marcus Aurelius</p>
            </div>
            <div className="hidden flex-1 lg:block">
              <p className="font-display text-xs tracking-widest text-gold uppercase">A conversation</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="New conversation"
              onClick={newConversation}
            >
              <Plus className="size-4" />
            </Button>
            {user ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Past conversations"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="size-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              aria-label="Voice and manner"
              onClick={() => setSettingsOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
            </Button>
            <AuthChip />
          </header>

          <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-8 lg:px-10 lg:py-6">
            <div className="mx-auto max-w-2xl">
              <Thread
                messages={messages}
                streaming={streaming}
                speakingId={speakingId}
                onSpeak={(id, text) => void speak(id, text)}
                onStopSpeak={stopSpeak}
                onSuggest={(text) => void send(text)}
              />
            </div>
          </div>

          <div className="border-t border-gold/10 bg-ink/70 px-4 py-3 backdrop-blur-sm lg:px-10">
            <div className="mx-auto max-w-2xl">
              <Composer
                value={draft}
                onChange={setDraft}
                onSend={() => void send(draft)}
                onMicToggle={() => void toggleMic()}
                recording={recording}
                busy={streaming}
              />
              <p className="mt-2 text-center font-serif text-xs text-muted">
                He answers from the second century. Sign in to keep the papers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Drawer.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/70" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] flex-col rounded-t-2xl bg-surface">
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gold/30" />
            <Drawer.Title className="px-5 pt-4 font-display text-sm tracking-[0.2em] text-gold uppercase">
              Voice & manner
            </Drawer.Title>
            <div className="overflow-y-auto px-5 pt-4 pb-10">
              <VoiceManner onPreviewVoice={(id) => void previewVoice(id)} previewingId={previewingId} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root open={historyOpen} onOpenChange={setHistoryOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/70" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-2xl bg-surface lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:w-96 lg:rounded-none lg:rounded-l-2xl">
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gold/30 lg:hidden" />
            <Drawer.Title className="px-5 pt-4 font-display text-sm tracking-[0.2em] text-gold uppercase">
              Papers
            </Drawer.Title>
            <ul className="overflow-y-auto px-3 py-3">
              {history.length === 0 ? (
                <li className="px-2 py-6 text-center font-serif text-sm text-muted">
                  No conversations kept yet.
                </li>
              ) : (
                history.map((c) => (
                  <li key={c.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void openConversation(c.id)}
                      className="min-w-0 flex-1 rounded-md px-3 py-2.5 text-left hover:bg-parchment/5"
                    >
                      <span className="block truncate font-serif text-sm text-parchment">{c.title}</span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete conversation"
                      onClick={() => void removeConversation(c.id)}
                    >
                      <Trash2 className="size-3.5 text-muted" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
