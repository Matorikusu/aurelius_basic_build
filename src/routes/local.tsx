import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/local")({ component: LocalGuide });

function LocalGuide() {
  return (
    <main className="min-h-dvh bg-bg px-6 py-16 text-fg">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-medium tracking-widest text-muted uppercase">Aurelius</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Run it yourself</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Free. No account. No API key. Marcus runs on your computer. Conversations never leave the
          device.
        </p>

        <a
          href="/aurelius-local.zip"
          download
          className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-5 text-sm font-medium text-bg"
        >
          Download the folder
        </a>

        <ol className="mt-12 flex flex-col gap-8 text-sm leading-relaxed">
          <Step n="1" title="Use Chrome or Edge">
            He runs on the device (WebGPU). A phone will struggle. First visit downloads a model
            once — about 1–2 GB — then it stays.
          </Step>
          <Step n="2" title="Install Node.js">
            LTS from <A href="https://nodejs.org">nodejs.org</A>, then open a new terminal. Only
            needed to serve the app on your machine.
          </Step>
          <Step n="3" title="Unzip and start">
            Unzip <span className="text-fg">aurelius-local.zip</span>, then:
            <Code>cd path/to/aurelius{"\n"}node server.mjs</Code>
            Open <span className="text-fg">http://localhost:8080</span>. No key to paste.
          </Step>
          <Step n="4" title="Optional: GitHub Pages">
            Push the folder to a repo named <span className="text-fg">aurelius</span>. Settings →
            Pages → Source: GitHub Actions. Visitors download the model in their own browser. Still
            free. Still no key.
          </Step>
        </ol>

        <p className="mt-12 text-xs text-muted">
          Created by S Whorton — Matorikusu 2026 — All rights reserved.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-fg">
          Back to the chamber
        </Link>
      </div>
    </main>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-elevated text-xs font-medium">
        {n}
      </span>
      <div>
        <p className="font-medium text-fg">{title}</p>
        <div className="mt-1 text-muted">{children}</div>
      </div>
    </li>
  );
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-fg underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-xl bg-surface px-4 py-3 text-xs text-fg">{children}</pre>
  );
}
