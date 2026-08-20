import { Volume2 } from "lucide-react";
import type { Conversation, Register } from "@/lib/types";
import type { Prefs } from "@/lib/prefs";
import { MODELS } from "@/lib/engine";
import { VOICES } from "@/lib/voices";
import { cn } from "@/lib/utils";

const REGISTERS: { id: Register; label: string; hint: string }[] = [
  { id: "journal", label: "Journal", hint: "Notes to himself" },
  { id: "counsel", label: "Counsel", hint: "A man to a man" },
  { id: "emperor", label: "Emperor", hint: "Duty, then philosophy" },
];

type Props = {
  prefs: Prefs;
  onChange: (next: Prefs) => void;
  onPreviewVoice: (voiceId: string) => void;
  previewingId: string | null;
  history: Conversation[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  backend: "ollama" | "webllm" | "none";
  modelName?: string | null;
  loadNote?: string;
};

export function Settings({
  prefs,
  onChange,
  onPreviewVoice,
  previewingId,
  history,
  onOpen,
  onDelete,
  backend,
  modelName,
  loadNote,
}: Props) {
  const hint = REGISTERS.find((r) => r.id === prefs.manner.register)?.hint;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Mind</h2>
        {backend === "ollama" ? (
          <p className="mt-2 text-sm text-muted">
            Using Ollama on this computer{modelName ? ` · ${modelName}` : ""}. Free. Nothing is sent
            away.
          </p>
        ) : backend === "webllm" ? (
          <>
            <p className="mt-1 text-sm text-muted">
              Runs in this browser. First visit downloads a model once, then it stays. Chrome or
              Edge on a computer.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-surface p-1">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ ...prefs, modelId: m.id })}
                  className={cn(
                    "rounded-full px-2 py-2 text-xs font-medium whitespace-nowrap",
                    prefs.modelId === m.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-muted">
              {MODELS.find((m) => m.id === prefs.modelId)?.hint}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Install Ollama from ollama.com, then run{" "}
            <span className="text-fg">ollama pull llama3.2</span>. No plugins. No GitHub. No API
            key.
          </p>
        )}
        {loadNote ? <p className="mt-2 text-xs text-muted">{loadNote}</p> : null}
      </section>

      <section>
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Manner</h2>
        <p className="mt-1 text-sm text-muted">How he thinks on the page.</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-surface p-1">
          {REGISTERS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange({ ...prefs, manner: { ...prefs.manner, register: r.id } })}
              className={cn(
                "rounded-full px-2 py-2 text-center text-xs font-medium transition-colors duration-150",
                prefs.manner.register === r.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted">{hint}</p>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted">
            <span>Gentle</span>
            <span>Austere</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={prefs.manner.austerity}
            onChange={(e) =>
              onChange({ ...prefs, manner: { ...prefs.manner, austerity: Number(e.target.value) } })
            }
            aria-label="Austerity of counsel"
            className="mt-2 w-full"
          />
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted">
            <span>Discourse</span>
            <span>Aphorism</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={prefs.manner.brevity}
            onChange={(e) =>
              onChange({ ...prefs, manner: { ...prefs.manner, brevity: Number(e.target.value) } })
            }
            aria-label="Brevity of speech"
            className="mt-2 w-full"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Voice</h2>
            <p className="mt-1 text-sm text-muted">Neural voice, on this device. Not the computer’s robot voice.</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            Speak replies
            <input
              type="checkbox"
              checked={prefs.autoSpeak}
              onChange={(e) => onChange({ ...prefs, autoSpeak: e.target.checked })}
              className="size-4 accent-fg"
            />
          </label>
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {VOICES.map((v) => {
            const active = v.id === prefs.voiceId;
            return (
              <li key={v.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-1.5",
                    active ? "bg-elevated" : "hover:bg-surface",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...prefs, voiceId: v.id })}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block text-sm font-medium text-fg">{v.name}</span>
                    <span className="block truncate text-xs text-muted">{v.quality}</span>
                  </button>
                  <button
                    type="button"
                    className="grid size-9 place-items-center rounded-full text-muted hover:text-fg"
                    aria-label={`Preview ${v.name}`}
                    onClick={() => onPreviewVoice(v.id)}
                    disabled={previewingId === v.id}
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Papers</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No conversations kept yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {history.map((c) => (
              <li key={c.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpen(c.id)}
                  className="min-w-0 flex-1 rounded-xl px-3 py-2 text-left text-sm text-fg hover:bg-elevated"
                >
                  <span className="block truncate">{c.title}</span>
                </button>
                <button
                  type="button"
                  className="px-2 text-xs text-muted hover:text-fg"
                  onClick={() => onDelete(c.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="pt-2 text-center text-xs leading-relaxed text-muted/70">
        Created by S Whorton — Matorikusu 2026 — All rights reserved.
      </p>
    </div>
  );
}
