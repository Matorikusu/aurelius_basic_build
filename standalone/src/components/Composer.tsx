import { Mic, Send, Square } from "lucide-react";
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onMicToggle: () => void;
  recording: boolean;
  busy: boolean;
  disabled?: boolean;
};

export function Composer({
  value,
  onChange,
  onSend,
  onMicToggle,
  recording,
  busy,
  disabled,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!busy && !disabled) onSend();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy && !disabled) onSend();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <button
        type="button"
        onClick={onMicToggle}
        disabled={busy}
        aria-label={recording ? "Stop recording" : "Speak to Marcus"}
        aria-pressed={recording}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-150",
          recording ? "bg-accent text-bg speak-ring" : "text-fg shadow-[var(--shadow-border)] hover:bg-fg/5",
        )}
      >
        {recording ? <Square className="size-4 fill-current" /> : <Mic className="size-4" />}
      </button>
      <label className="sr-only" htmlFor="counsel">
        Speak to Marcus
      </label>
      <textarea
        id="counsel"
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={busy || recording}
        placeholder={recording ? "Listening…" : "Speak of what disturbs the mind"}
        className={cn(
          "max-h-40 min-h-11 flex-1 resize-none rounded-2xl bg-surface px-4 py-2.5",
          "text-sm leading-relaxed text-fg placeholder:text-muted",
          "shadow-[var(--shadow-border)] outline-none",
          "focus:shadow-[var(--shadow-border-hover)]",
          "disabled:opacity-60",
        )}
      />
      <button
        type="submit"
        disabled={busy || recording || !value.trim() || disabled}
        aria-label="Send"
        className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-bg disabled:opacity-40"
      >
        <Send className="size-4" />
      </button>
    </form>
  );
}
