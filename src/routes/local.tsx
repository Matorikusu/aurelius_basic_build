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
          Free. No API key. Neural voices. You can run it on your computer, or put it on GitHub
          Pages so anyone can open the link.
        </p>

        <a
          href="/aurelius-local.zip"
          download
          className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-5 text-sm font-medium text-bg"
        >
          Download the folder
        </a>

        <ol className="mt-12 flex flex-col gap-8 text-sm leading-relaxed">
          <Step n="1" title="Install Ollama (the mind)">
            Download the free app from <A href="https://ollama.com">ollama.com</A> and open it. It
            is not a plugin and not a repository. Then in a terminal:
            <Code>ollama pull llama3.2</Code>
            That download is about 2 GB, once. Leave Ollama running.
          </Step>
          <Step n="2" title="Install Node.js (to open the page)">
            LTS from <A href="https://nodejs.org">nodejs.org</A>, then open a new terminal.
          </Step>
          <Step n="3" title="Start it">
            Windows: double-click <span className="text-fg">start.bat</span>. Mac/Linux:
            <Code>bash start.sh</Code>
            First run downloads llama3.2 (~2 GB, once). Then open{" "}
            <span className="text-fg">http://localhost:8080</span>.
          </Step>
          <Step n="4" title="Put it on a website (GitHub Pages)">
            Push this folder to a public repo named <span className="text-fg">aurelius</span>.
            Settings → Pages → Source: <span className="text-fg">GitHub Actions</span>. Anyone can
            then open <span className="text-fg">https://YOURNAME.github.io/aurelius/</span> in Chrome
            or Edge. First visit downloads a free model in their browser. No Ollama needed for
            visitors.
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
