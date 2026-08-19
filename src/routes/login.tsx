import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/chamber.jpg)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-ink/75" />
      <div className="grain absolute inset-0 opacity-40" />

      <div className="relative w-full max-w-sm text-center">
        <img
          src="/marcus.jpg"
          alt="Marcus Aurelius"
          className="mx-auto size-28 rounded-full object-cover face-crop outline outline-1 -outline-offset-1 outline-gold/30"
        />
        <p className="mt-6 font-display text-xs tracking-[0.32em] text-gold uppercase">The Chamber</p>
        <h1 className="mt-2 font-display text-4xl text-parchment">Aurelius</h1>
        <p className="mt-3 font-serif text-sm leading-relaxed text-muted">
          Keep your conversations with the emperor. Sign in, then return to the tent.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                size="lg"
                className="w-full font-display tracking-wide"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="font-serif text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>

        <Link
          to="/"
          className="mt-8 inline-block font-serif text-sm text-gold underline-offset-4 hover:underline"
        >
          Enter as a guest
        </Link>
      </div>
    </main>
  );
}
