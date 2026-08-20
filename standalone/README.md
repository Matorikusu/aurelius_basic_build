# Aurelius — local & GitHub Pages

A conversation with Marcus Aurelius. His notes, his limits, his manner.

**Free. No account. No API key. He runs on your device.**

Created by S Whorton — Matorikusu 2026 — All rights reserved.

---

## What you need

1. **A computer with Chrome or Edge** (WebGPU). A phone will struggle.
2. **Node.js 20+** from [nodejs.org](https://nodejs.org) — only if you run it on your machine. GitHub Pages visitors do not need Node.
3. The first visit **downloads a model once** (about 1–2 GB) and then keeps it. No one is billed.

---

## Run on your computer

1. Unzip this folder and open a terminal **inside it**.
2. Start it:

```bash
node server.mjs
```

3. Open **http://localhost:8080**
4. Wait until it says he is ready (first time only).
5. Speak.

To stop: `Ctrl+C`.

Voices — **Lux, Orion, Altair, Perseus** — use your computer’s speech. Also free.

In Settings you can pick **Steady** (better, ~2 GB) or **Swift** (lighter, ~1 GB).

### If you want to change the code

```bash
npm install
npm run dev
```

After edits:

```bash
npm run build
npm start
```

---

## Put it on GitHub Pages

No Cloudflare. No key. The model downloads in each visitor’s browser, once.

1. Create a GitHub repository named `aurelius`.
2. From **inside this folder**:

```bash
git init
git add .
git commit -m "Aurelius"
git branch -M main
git remote add origin https://github.com/YOURNAME/aurelius.git
git push -u origin main
```

3. GitHub → **Settings → Pages** → Source: **GitHub Actions**.
4. Wait for the workflow. Your site will be `https://YOURNAME.github.io/aurelius/`.

---

## Privacy

- Conversation and model stay **on the device**.
- Nothing is sent to xAI, OpenAI, or a server of ours.

---

## If something fails

| Symptom | Fix |
| --- | --- |
| “cannot run him on-device” | Use Chrome or Edge on a computer, not Firefox/Safari/phone. |
| Stuck on loading | Wait — first download is large. Stay on Wi‑Fi. Next visit is instant. |
| `node` not found | Install Node.js LTS, then open a **new** terminal. |
| Mic does nothing | Allow the microphone, or type. |

---

Created by S Whorton — Matorikusu 2026 — All rights reserved.
