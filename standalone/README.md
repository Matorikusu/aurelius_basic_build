# Aurelius — local & GitHub Pages

A conversation with Marcus Aurelius. Same mind as the hosted app: his notes, his limits, his manner. **No account. Conversations stay in your browser.**

Created by S Whorton — Matorikusu 2026 — All rights reserved.

---

## What you need

1. **Node.js 20 or newer** — [https://nodejs.org](https://nodejs.org) (LTS).
2. **An xAI API key** — create one at [https://console.x.ai](https://console.x.ai). This is the only thing that costs anything (xAI bills the Grok calls). The app itself is free.
3. **A terminal** (Terminal on Mac, PowerShell or Terminal on Windows).

That is enough to run it on your computer.

For **GitHub Pages** you also need:

4. A **GitHub** account.
5. A free **Cloudflare** account — GitHub Pages is static, so a tiny Worker is the bridge to xAI. It does not store your key.

---

## Run on your computer (3 minutes)

1. Unzip this folder and open a terminal **inside it**.
2. Start it (Node.js only — no `npm install` required):

```bash
node server.mjs
```

3. Open **http://localhost:8080**
4. Open **Settings** (sliders icon on a phone; the left column on a computer).
5. Paste your xAI API key. It is saved only in this browser.

To stop: press `Ctrl+C` in the terminal.

### If you want to change the code

```bash
npm install
npm run dev
```

Same address: **http://localhost:8080**. After edits:

```bash
npm run build
npm start
```

Optional, so you do not paste the key every time on this machine: copy `.env.example` to `.env` and put the key there, then restart.

```bash
cp .env.example .env
# edit .env and set XAI_API_KEY=xai-...
```

---

## Put it on GitHub Pages

The site can live at `https://YOURNAME.github.io/aurelius/`. Each visitor uses **their own** API key in Settings. Yours is never in the repo.

### A. Upload the app

1. Create a new GitHub repository named `aurelius` (public is fine).
2. From **inside this folder**:

```bash
git init
git add .
git commit -m "Aurelius local"
git branch -M main
git remote add origin https://github.com/YOURNAME/aurelius.git
git push -u origin main
```

3. On GitHub: **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Wait for the **GitHub Pages** workflow to finish (Actions tab). Your site URL appears there.

### B. The free proxy (required for Pages)

Browsers on GitHub Pages are not allowed to call xAI directly. The included `cloudflare-worker.js` is a 1-file proxy.

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and sign up (free).
2. **Workers & Pages → Create → Worker**.
3. Paste the contents of `cloudflare-worker.js` over the starter code. Deploy.
4. Copy the Worker URL, like `https://aurelius.YOURNAME.workers.dev`.
5. Open your GitHub Pages site → **Settings** → paste:
   - your xAI API key
   - that Worker URL

You only do this once per browser.

---

## Voices

- **xAI voices** — Lux, Orion, Altair, Perseus (uses your key).
- **Browser (free)** — uses your computer’s voices. No extra API call. Quality depends on the browser (Safari and Chrome are best).

Manner (journal / counsel / emperor, austerity, brevity) works the same as the hosted app.

---

## Privacy

- Conversations are stored in **localStorage** on your device. Clearing site data deletes them.
- The API key in Settings never leaves your browser except as an `Authorization` header to xAI (or your Worker).
- Do not commit `.env`. It is gitignored.

---

## If something fails

| Symptom | Fix |
| --- | --- |
| `npm` not found | Install Node.js LTS, then open a **new** terminal. |
| “Add an xAI API key” | Settings → paste a key from console.x.ai. |
| “Marcus could not be reached” | Check the key, or your xAI credit. |
| Works locally, silent on GitHub Pages | Add the Cloudflare Worker URL in Settings. |
| Mic does nothing | Chrome/Safari only; allow microphone; or type. |

---

Created by S Whorton — Matorikusu 2026 — All rights reserved.
