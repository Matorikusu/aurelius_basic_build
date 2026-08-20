import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Register } from "@/lib/marcus/types";
import { VOICES } from "@/lib/marcus/voices";
import { usePrefs } from "@/lib/prefs-store";
import { cn } from "@/lib/utils";

const REGISTERS: { id: Register; label: string; hint: string }[] = [
  { id: "journal", label: "Journal", hint: "Notes to himself" },
  { id: "counsel", label: "Counsel", hint: "A man to a man" },
  { id: "emperor", label: "Emperor", hint: "Duty, then philosophy" },
];

type Props = {
  onPreviewVoice: (voiceId: string) => void;
  previewingId: string | null;
};

export function VoiceManner({ onPreviewVoice, previewingId }: Props) {
  const voiceId = usePrefs((s) => s.voiceId);
  const manner = usePrefs((s) => s.manner);
  const autoSpeak = usePrefs((s) => s.autoSpeak);
  const setVoice = usePrefs((s) => s.setVoice);
  const setRegister = usePrefs((s) => s.setRegister);
  const setAusterity = usePrefs((s) => s.setAusterity);
  const setBrevity = usePrefs((s) => s.setBrevity);
  const setAutoSpeak = usePrefs((s) => s.setAutoSpeak);
  const activeRegister = REGISTERS.find((r) => r.id === manner.register);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Manner</h2>
        <p className="mt-1 text-sm text-muted">How he thinks on the page.</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-surface p-1">
          {REGISTERS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegister(r.id)}
              className={cn(
                "rounded-full px-2 py-2 text-center text-xs font-medium transition-colors duration-150",
                manner.register === r.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted">{activeRegister?.hint}</p>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted">
            <span>Gentle</span>
            <span>Austere</span>
          </div>
          <Slider
            value={manner.austerity}
            onChange={setAusterity}
            ariaLabel="Austerity of counsel"
          />
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted">
            <span>Discourse</span>
            <span>Aphorism</span>
          </div>
          <Slider value={manner.brevity} onChange={setBrevity} ariaLabel="Brevity of speech" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Voice</h2>
            <p className="mt-1 text-sm text-muted">The instrument, not the man.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Speak replies</span>
            <Switch
              checked={autoSpeak}
              onCheckedChange={setAutoSpeak}
              ariaLabel="Speak his replies aloud"
            />
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {VOICES.map((v) => {
            const active = v.id === voiceId;
            return (
              <li key={v.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors duration-150",
                    active ? "bg-elevated" : "hover:bg-surface",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setVoice(v.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className={cn("block text-sm font-medium", active ? "text-fg" : "text-fg/80")}>
                      {v.name}
                    </span>
                    <span className="block truncate text-xs text-muted">{v.quality}</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted hover:text-fg"
                    aria-label={`Preview ${v.name}`}
                    onClick={() => onPreviewVoice(v.id)}
                    disabled={previewingId === v.id}
                  >
                    <Volume2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="pt-2 text-center text-xs leading-relaxed text-muted/70">
        Created by S Whorton — Matorikusu 2026 — All rights reserved.
      </p>
    </div>
  );
}
