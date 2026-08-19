import { cn } from "@/lib/utils";

type Props = {
  speaking: boolean;
  compact?: boolean;
};

export function Portrait({ speaking, compact }: Props) {
  return (
    <div className={cn("relative overflow-hidden", compact ? "size-11 rounded-full" : "aspect-[2/3] w-full rounded-lg")}>
      <img
        src="/marcus.jpg"
        alt="Marcus Aurelius"
        className={cn(
          "size-full object-cover outline-solid outline-1 -outline-offset-1 outline-gold/20",
          compact ? "face-crop" : "portrait-crop",
        )}
      />
      <div
        className={cn(
          "flicker pointer-events-none absolute inset-0 candle-glow",
          speaking && "opacity-80",
        )}
      />
      {speaking ? (
        <div className="speak-ring pointer-events-none absolute inset-0 rounded-[inherit]" />
      ) : null}
    </div>
  );
}

export function IdentityBlock() {
  return (
    <div className="mt-4">
      <p className="font-display text-xs tracking-widest text-gold uppercase">The Chamber</p>
      <h1 className="mt-1 font-display text-2xl leading-tight text-parchment">Marcus Aurelius</h1>
      <p className="mt-1 font-serif text-sm text-muted">Emperor · philosopher · 161–180</p>
      <p className="mt-3 font-serif text-sm leading-relaxed text-parchment/75">
        He knows his own age, his own notes, and the Stoic art of judgment. He does not know yours.
        He will reason anyway.
      </p>
    </div>
  );
}
