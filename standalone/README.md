# Aurelius

A conversation with Marcus Aurelius. His notes, his limits, his manner.

**Free. No API key.** Neural voices (Lux, Orion, Altair, Perseus) run on the device.

Created by S Whorton — Matorikusu 2026 — All rights reserved.

---

## Put it on a public website (GitHub Pages)

Anyone with Chrome or Edge can open the link and talk to him. No Ollama. No account.

1. Create a GitHub repository named `aurelius` (public).
2. From **inside this folder**:

```bash
git init
git add .
git commit -m "Aurelius"
git branch -M main
git remote add origin https://github.com/YOURNAME/aurelius.git
git push -u origin main
```

3. GitHub → **Settings → Pages**
4. **Build and deployment → Source:** GitHub Actions
5. Open the **Actions** tab and wait until **GitHub Pages** is green.
6. Your site is `https://YOURNAME.github.io/aurelius/`

The first visit downloads his mind (~1 GB) and his voice (~80 MB) into that visitor’s browser. After that it is cached. Nothing is billed. Use Chrome or Edge on a computer — phones will struggle.

You can later add a custom domain under Settings → Pages.

---

## Run it on your computer (better counsel)

Locally he can use **Ollama** (the same logic you already like). Voices are the new neural ones either way.

1. Install [Ollama](https://ollama.com) and open it.
2. Install [Node.js LTS](https://nodejs.org).
3. Windows: double-click `start.bat`. Mac/Linux: `bash start.sh`.
4. Open **http://localhost:8080**

---

## Voices

Lux, Orion, Altair, Perseus are now a small neural TTS model (Kokoro), not the computer’s robot voice. First click of **Hear him** may take a few seconds while the voice loads.

Turn on **Speak replies** in Settings to hear every answer.

---

Created by S Whorton — Matorikusu 2026 — All rights reserved.
