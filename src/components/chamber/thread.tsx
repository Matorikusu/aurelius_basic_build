import { Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GREETING, type ChatMessage } from "@/lib/marcus/types";

type Props = {
  messages: ChatMessage[];
  streaming: boolean;
  speakingId: string | null;
  onSpeak: (id: string, text: string) => void;
  onStopSpeak: () => void;
};

export function Thread({ messages, streaming, speakingId, onSpeak, onStopSpeak }: Props) {
  const empty = messages.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {empty ? (
        <AssistantBubble
          text={GREETING}
          speaking={speakingId === "greeting"}
          streaming={false}
          onSpeak={() => onSpeak("greeting", GREETING)}
          onStopSpeak={onStopSpeak}
        />
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
      <p className="max-w-lg rounded-2xl bg-elevated px-4 py-3 text-sm leading-relaxed text-fg">
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
        className="mt-0.5 size-8 shrink-0 rounded-full object-cover face-crop ring-1 ring-line"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-widest text-muted uppercase">Marcus</p>
        <p className="mt-1 text-base leading-relaxed text-fg whitespace-pre-wrap">
          {text}
          {streaming && !text ? <span className="text-muted">He considers…</span> : null}
          {streaming ? (
            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-fg/70" />
          ) : null}
        </p>
        {!streaming && text ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-8 px-2 text-muted hover:text-fg"
            onClick={speaking ? onStopSpeak : onSpeak}
            aria-label={speaking ? "Stop speaking" : "Speak this reply"}
          >
            {speaking ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-3.5" />}
            <span className="text-xs">{speaking ? "Silence" : "Hear him"}</span>
          </Button>
        ) : streaming ? (
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
            <Loader2 className="size-3 animate-spin" />
            Writing
          </span>
        ) : null}
      </div>
    </div>
  );
}
