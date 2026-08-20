import { Volume2 } from "lucide-react";
import type { Conversation, Register } from "@/lib/types";
import type { Prefs, VoiceEngine } from "@/lib/prefs";
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
  hasServerKey: boolean;
  needsProxy: boolean;
  history: Conversation[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

export function Settings({
  prefs,
  onChange,
  onPreviewVoice,
  previewingId,
  hasServerKey,
  needsProxy,
  history,
  onOpen,
  onDelete,
}: Props) {
  const hint = REGISTERS.find((r) => r.id === prefs.manner.register)?.hint;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Key</h2>
        <p className="mt-1 text-sm text-muted">
          {hasServerKey
            ? "A key is already set on this machine. You can leave this blank."
            : "Your xAI key stays in this browser. It is never uploaded to GitHub."}
        </p>
        <input
          type="password"
          autoComplete="off"
          value={prefs.apiKey}
          placeholder={hasServerKey ? "Using server key" : "xai-…"}
          onChange={(e) => onChange({ ...prefs, apiKey: e.target.value.trim() })}
          className="mt-3 w-full rounded-xl bg-surface px-3 py-2.5 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-muted focus:shadow-[var(--shadow-border-hover)]"
        />
        {needsProxy ? (
          <>
            <p className="mt-4 text-sm text-muted">
              GitHub Pages cannot call xAI directly. Paste your Cloudflare Worker URL.
            </p>
            <input
              type="url"
              value={prefs.proxyUrl}
              placeholder="https://aurelius.yourname.workers.dev"
              onChange={(e) => onChange({ ...prefs, proxyUrl: e.target.value.trim() })}
              className="mt-2 w-full rounded-xl bg-surface px-3 py-2.5 text-sm text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-muted focus:shadow-[var(--shadow-border-hover)]"
            />
          </>
        ) : null}
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
            <p className="mt-1 text-sm text-muted">The instrument, not the man.</p>
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
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-surface p-1">
          {(["xai", "browser"] as VoiceEngine[]).map((engine) => (
            <button
              key={engine}
              type="button"
              onClick={() => onChange({ ...prefs, voiceEngine: engine })}
              className={cn(
                "rounded-full px-2 py-2 text-xs font-medium whitespace-nowrap",
                prefs.voiceEngine === engine ? "bg-elevated text-fg" : "text-muted hover:text-fg",
              )}
            >
              {engine === "xai" ? "xAI" : "Browser"}
            </button>
          ))}
        </div>
        {prefs.voiceEngine === "xai" ? (
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
        ) : (
          <p className="mt-3 text-sm text-muted">
            Uses your computer’s voices. No API call. Quality varies by browser.
          </p>
        )}
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
