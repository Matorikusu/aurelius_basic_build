import { Plus, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Composer } from "@/components/Composer";
import { IdentityBlock, Portrait } from "@/components/Portrait";
import { Settings } from "@/components/Settings";
import { Thread } from "@/components/Thread";
import { speakBrowser, unlockSpeech } from "@/lib/audio";
import { probeHealth, streamOllama, type Health } from "@/lib/api";
import { ensureEngine, interruptCounsel, streamCounsel, webgpuAvailable } from "@/lib/engine";
import { ensureTTS, speakNeural, stopNeural } from "@/lib/tts";
import { loadPrefs, savePrefs, type Prefs } from "@/lib/prefs";
import {
  loadActiveId,
  loadConversations,
  saveActiveId,
  saveConversations,
} from "@/lib/storage";
import type { ChatMessage, Conversation } from "@/lib/types";
import { uid } from "@/lib/utils";
import { VOICE_SAMPLE } from "@/lib/voices";

type RecCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function speechRec(): RecCtor | null {
  const w = window as Window & { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function App() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [health, setHealth] = useState<Health | null>(null);
  const [backend, setBackend] = useState<"ollama" | "webllm" | "none">("none");
  const [conversationId, setConversationId] = useState(() => loadActiveId() || uid());
  const [history, setHistory] = useState<Conversation[]>(() => loadConversations());
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const id = loadActiveId();
    const found = loadConversations().find((c) => c.id === id);
    return found?.messages ?? [];
  });
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loadNote, setLoadNote] = useState("Looking for a free local model…");

  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => {
    const unlock = () => unlockSpeech();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const localHost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    void ensureTTS((t) => {
      if (!cancelled) setLoadNote(t);
    }).catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "The neural voice could not load. Hear him may use a fallback.");
      }
    });

    async function tick() {
      const h = await probeHealth();
      if (cancelled) return false;
      setHealth(h);
      if (h.backend === "ollama" && h.model) {
        setBackend("ollama");
        setReady(true);
        setLoadNote(h.hint);
        setError(null);
        return true;
      }
      if (localHost) {
        setBackend("none");
        setReady(false);
        setLoadNote(h.hint);
        return false;
      }
      return false;
    }

    void (async () => {
      const ok = await tick();
      if (cancelled || ok || localHost) return;
      if (!webgpuAvailable()) {
        setBackend("none");
        setReady(false);
        setLoadNote("Use Chrome or Edge on a computer. His mind runs in the browser here.");
        setError("This browser cannot run an on-device model. Chrome or Edge will.");
        return;
      }
      setBackend("webllm");
      setReady(false);
      setLoadNote("Downloading his mind into this browser. Once, then it stays. Free.");
      try {
        await ensureEngine(prefs.modelId, (p) => {
          if (cancelled) return;
          const pct = Math.round((p.progress || 0) * 100);
          setLoadNote(pct > 0 ? `${p.text || "Loading"} · ${pct}%` : p.text || "Downloading his mind…");
        });
        if (cancelled) return;
        setReady(true);
        setLoadNote("Ready. He thinks in this browser.");
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setBackend("none");
        setReady(false);
        const msg = err instanceof Error ? err.message : "The mind could not be loaded.";
        setLoadNote(msg);
        setError(msg);
      }
    })();

    const id = window.setInterval(() => {
      if (!localHost) {
        window.clearInterval(id);
        return;
      }
      void tick().then((ok) => {
        if (ok) window.clearInterval(id);
      });
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [prefs.modelId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopNeural();
      recRef.current?.stop();
    };
  }, []);

  const persist = useCallback((id: string, msgs: ChatMessage[]) => {
    const title =
      msgs.find((m) => m.role === "user")?.content.replace(/\s+/g, " ").trim().slice(0, 48) ||
      "Untitled counsel";
    setHistory((prev) => {
      const next: Conversation[] = [
        { id, title, messages: msgs, updatedAt: Date.now() },
        ...prev.filter((c) => c.id !== id),
      ];
      saveConversations(next);
      return next;
    });
    saveActiveId(id);
  }, []);

  const speak = useCallback(
    async (id: string, text: string, voice = prefs.voiceId) => {
      if (!text.trim()) return;
      stopNeural();
      setSpeakingId(id);
      try {
        try {
          await speakNeural(text, voice);
        } catch {
          await speakBrowser(text, voice);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "The voice faltered.");
      } finally {
        setSpeakingId((cur) => (cur === id ? null : cur));
      }
    },
    [prefs.voiceId],
  );

  const stopSpeak = useCallback(() => {
    stopNeural();
    setSpeakingId(null);
    setPreviewingId(null);
  }, []);

  const previewVoice = useCallback(
    async (id: string) => {
      stopNeural();
      setPreviewingId(id);
      setSpeakingId("preview");
      try {
        await speak("preview", VOICE_SAMPLE, id);
      } finally {
        setPreviewingId(null);
      }
    },
    [speak],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.replace(/\s+/g, " ").trim();
      if (!content || streaming) return;
      if (!ready) {
        setError("He is not ready yet. Install Ollama if you have not — see the note above.");
        return;
      }
      stopSpeak();
      setDraft("");
      setError(null);
      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: "" };
      const prior = messages;
      const nextMsgs = [...prior, userMsg, assistantMsg];
      setMessages(nextMsgs);
      setStreaming(true);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const onDelta = (delta: string) => {
          setMessages((cur) =>
            cur.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m)),
          );
        };
        const full =
          backend === "webllm"
            ? await streamCounsel({
                messages: [...prior, userMsg],
                manner: prefs.manner,
                modelId: prefs.modelId,
                onProgress: () => {},
                signal: ac.signal,
                onDelta,
              })
            : await streamOllama({
                messages: [...prior, userMsg],
                manner: prefs.manner,
                model: health?.model,
                signal: ac.signal,
                onDelta,
              });
        const finalText = full.trim();
        const done = nextMsgs.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: finalText || m.content } : m,
        );
        setMessages(done);
        persist(conversationId, done);
        if (prefs.autoSpeak && finalText) void speak(assistantMsg.id, finalText);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Marcus could not be reached.";
        setError(msg);
        setMessages((cur) =>
          cur.map((m) =>
            m.id === assistantMsg.id && !m.content
              ? { ...m, content: `I am silent a moment. ${msg}` }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [streaming, ready, backend, health, messages, prefs, conversationId, persist, speak, stopSpeak],
  );

  function newConversation() {
    abortRef.current?.abort();
    interruptCounsel();
    stopSpeak();
    const id = uid();
    setConversationId(id);
    saveActiveId(id);
    setMessages([]);
    setDraft("");
    setStreaming(false);
    setSettingsOpen(false);
  }

  function openConversation(id: string) {
    const found = history.find((c) => c.id === id);
    if (!found) return;
    abortRef.current?.abort();
    interruptCounsel();
    stopSpeak();
    setConversationId(id);
    saveActiveId(id);
    setMessages(found.messages);
    setSettingsOpen(false);
  }

  function removeConversation(id: string) {
    const next = history.filter((c) => c.id !== id);
    setHistory(next);
    saveConversations(next);
    if (id === conversationId) newConversation();
  }

  function toggleMic() {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    const Ctor = speechRec();
    if (!Ctor) {
      setError("This browser cannot hear you. Type instead.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript?.trim();
      if (text) setDraft((d) => (d ? `${d} ${text}` : text));
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => {
      setRecording(false);
      recRef.current = null;
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
  }

  const speaking = speakingId !== null;
  const settingsPanel = (
    <Settings
      prefs={prefs}
      onChange={setPrefs}
      onPreviewVoice={(id) => void previewVoice(id)}
      previewingId={previewingId}
      history={history}
      onOpen={openConversation}
      onDelete={removeConversation}
      backend={backend}
      modelName={health?.model}
      loadNote={ready ? undefined : loadNote}
    />
  );

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <div className="relative mx-auto flex min-h-dvh max-w-6xl">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-line lg:flex">
          <div className="p-8">
            <Portrait speaking={speaking} />
            <IdentityBlock />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">{settingsPanel}</div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <div className="lg:hidden">
              <Portrait speaking={speaking} compact />
            </div>
            <div className="min-w-0 flex-1 lg:hidden">
              <p className="text-xs font-medium tracking-widest text-muted uppercase">Aurelius</p>
              <p className="truncate text-sm font-medium text-fg">Marcus Aurelius</p>
            </div>
            <div className="hidden flex-1 lg:block">
              <p className="text-xs font-medium tracking-widest text-muted uppercase">A conversation</p>
            </div>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full text-fg hover:bg-fg/10"
              aria-label="New conversation"
              onClick={newConversation}
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full text-fg hover:bg-fg/10 lg:hidden"
              aria-label="Voice and manner"
              onClick={() => setSettingsOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </header>

          <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-8 lg:px-10 lg:py-6">
            <div className="mx-auto max-w-2xl">
              {!ready ? (
                backend === "webllm" ||
                (typeof window !== "undefined" &&
                  window.location.hostname !== "localhost" &&
                  window.location.hostname !== "127.0.0.1") ? (
                  <div className="mb-6 rounded-2xl bg-surface px-5 py-6 text-sm leading-relaxed text-muted">
                    <p className="font-medium text-fg">Preparing Marcus</p>
                    <p className="mt-2">{loadNote}</p>
                    <p className="mt-3 text-xs">
                      First visit downloads a free model into this browser. After that it is instant.
                      Use Chrome or Edge on a computer.
                    </p>
                  </div>
                ) : (
                  <SetupNote note={loadNote} />
                )
              ) : null}
              <Thread
                messages={messages}
                streaming={streaming}
                speakingId={speakingId}
                onSpeak={(id, text) => void speak(id, text)}
                onStopSpeak={stopSpeak}
              />
            </div>
          </div>

          <div className="border-t border-line bg-bg/80 px-4 py-3 lg:px-10">
            <div className="mx-auto max-w-2xl">
              <Composer
                value={draft}
                onChange={setDraft}
                onSend={() => void send(draft)}
                onMicToggle={toggleMic}
                recording={recording}
                busy={streaming || !ready}
              />
              <p className="mt-2 text-center text-xs text-muted">
                {error ?? "He answers from the second century. Free. On this device."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/70"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-3xl bg-surface">
            <div className="flex items-center justify-between px-5 pt-4">
              <p className="text-sm font-medium tracking-widest text-muted uppercase">Voice & manner</p>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full text-fg hover:bg-fg/10"
                aria-label="Close"
                onClick={() => setSettingsOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pt-4 pb-10">{settingsPanel}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SetupNote({ note }: { note: string }) {
  return (
    <div className="mb-6 rounded-2xl bg-surface px-5 py-6 text-sm leading-relaxed text-muted">
      <p className="font-medium text-fg">He needs a free local mind</p>
      <p className="mt-2">{note}</p>
      <ol className="mt-4 flex flex-col gap-2 text-fg">
        <li>
          1. Install <span className="font-medium">Ollama</span> from{" "}
          <a className="underline-offset-4 hover:underline" href="https://ollama.com" target="_blank" rel="noreferrer">
            ollama.com
          </a>{" "}
          — a free app, like Chrome. No plugins. No GitHub.
        </li>
        <li>
          2. Open a terminal and run{" "}
          <code className="rounded bg-elevated px-1.5 py-0.5 text-xs">ollama pull llama3.2</code>
        </li>
        <li>3. Refresh this page.</li>
      </ol>
    </div>
  );
}
