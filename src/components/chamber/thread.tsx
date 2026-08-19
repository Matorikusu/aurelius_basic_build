import { Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GREETING, SUGGESTIONS, type ChatMessage } from "@/lib/marcus/types";
import { cn } from "@/lib/utils";

type Props = {
  messages: ChatMessage[];
  streaming: boolean;
  speakingId: string | null;
  onSpeak: (id: string, text: string) => void;
  onStopSpeak: () => void;
  onSuggest: (text: string) => void;
};

export function Thread({
  messages,
  streaming,
  speakingId,
  onSpeak,
  onStopSpeak,
  onSuggest,
}: Props) {
  const empty = messages.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {empty ? (
        <>
          <AssistantBubble
            text={GREETING}
            speaking={speakingId === "greeting"}
            streaming={false}
            onSpeak={() => onSpeak("greeting", GREETING)}
            onStopSpeak={onStopSpeak}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onSuggest(s.text)}
                className={cn(
                  "enter rounded-lg bg-surface/80 px-4 py-2.5 text-left shadow-[var(--shadow-border)]",
                  "transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)]",
                  "active:scale-[0.96]",
                )}
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                <span className="block font-display text-sm text-gold">{s.label}</span>
                <span className="mt-1 block font-serif text-xs leading-relaxed text-muted line-clamp-2">
                  {s.text}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        messages.map((m) =>
          m.role === "user" ? (
            <UserBubble key={m.id} text={m.content} />
          ) : (
            <AssistantBubble
              key={m.id}
              text={m.content}
              speaking={speakingId === m.id}
              streaming={streaming && m === messages[messages.length - 1]}
              onSpeak={() => onSpeak(m.id, m.content)}
              onStopSpeak={onStopSpeak}
            />
          ),
        )
      )}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-lg rounded-lg bg-gold/10 px-4 py-3 font-serif text-sm leading-relaxed text-parchment">
        {text}
      </p>
    </div>
  );
}

function AssistantBubble({
  text,
  speaking,
  streaming,
  onSpeak,
  onStopSpeak,
}: {
  text: string;
  speaking: boolean;
  streaming: boolean;
  onSpeak: () => void;
  onStopSpeak: () => void;
}) {
  return (
    <div className="flex gap-3">
      <img
        src="/marcus.jpg"
        alt=""
        className="mt-1 size-8 shrink-0 rounded-full object-cover face-crop outline outline-1 -outline-offset-1 outline-gold/25"
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs tracking-widest text-gold uppercase">Marcus</p>
        <p className="mt-1 font-serif text-base leading-relaxed text-parchment whitespace-pre-wrap">
          {text}
          {streaming && !text ? <span className="text-muted">He considers…</span> : null}
          {streaming ? (
            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-gold/80" />
          ) : null}
        </p>
        {!streaming && text ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-8 px-2 text-muted hover:text-gold"
            onClick={speaking ? onStopSpeak : onSpeak}
            aria-label={speaking ? "Stop speaking" : "Speak this reply"}
          >
            {speaking ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-3.5" />}
            <span className="font-serif text-xs">{speaking ? "Silence" : "Hear him"}</span>
          </Button>
        ) : streaming ? (
          <span className="mt-2 inline-flex items-center gap-1.5 font-serif text-xs text-muted">
            <Loader2 className="size-3 animate-spin" />
            Writing
          </span>
        ) : null}
      </div>
    </div>
  );
}
