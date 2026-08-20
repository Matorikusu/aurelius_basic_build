import { asset, cn } from "@/lib/utils";

export function Portrait({ speaking, compact }: { speaking: boolean; compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-surface",
        compact ? "size-11" : "mx-auto aspect-square w-40",
      )}
    >
      <img
        src={asset("marcus.jpg")}
        alt="Marcus Aurelius"
        className={cn("size-full object-cover", compact ? "face-crop" : "portrait-crop")}
      />
      {speaking ? (
        <div className="speak-ring pointer-events-none absolute inset-0 rounded-full" />
      ) : null}
    </div>
  );
}

export function IdentityBlock() {
  return (
    <div className="mt-5 text-center">
      <p className="text-xs font-medium tracking-widest text-muted uppercase">Aurelius</p>
      <h1 className="mt-1 text-2xl leading-tight font-semibold tracking-tight text-fg">
        Marcus Aurelius
      </h1>
      <p className="mt-1 text-sm text-muted">Emperor · philosopher · 161–180</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        He knows his own age, his own notes, and the Stoic art of judgment. He does not know
        yours. He will reason anyway.
      </p>
    </div>
  );
}
