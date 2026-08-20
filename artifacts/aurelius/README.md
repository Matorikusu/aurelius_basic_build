# Aurelius

A modern, standalone conversation with **Marcus Aurelius** — limited to his age and the thinking of the *Meditations*.

Black / grey / white UI. Black-and-white bust. No accounts required.

## Voices

- **Lux** — grounded, quietly wise  
- **Orion** — rich and resonant  
- **Altair** — refined, even  
- **Perseus** — steady, trustworthy  

Speech uses your browser’s built-in voices (free, local).

## Model (free)

In **Settings**, choose a provider:

| Provider | Cost | Notes |
|---|---|---|
| **Ollama** (default) | Free, local | Install [ollama.com](https://ollama.com), run `ollama pull llama3.2`, then `ollama serve`. Base URL: `http://localhost:11434/v1` |
| **Groq** | Free tier | [console.groq.com](https://console.groq.com) → API key |
| **OpenRouter** | Free models | [openrouter.ai](https://openrouter.ai) → API key; e.g. `meta-llama/llama-3.2-3b-instruct:free` |
| **Custom** | — | Any OpenAI-compatible `/v1/chat/completions` endpoint |

API keys are stored only in your browser (`localStorage`).

> **GitHub Pages:** Ollama only works when the page is opened on the same machine as Ollama (or via a tunnel). For a public site, use Groq or OpenRouter free models. Some hosts block browser CORS; if so, put a tiny proxy in front or run the folder locally.

## Run locally

```bash
# any static server
npx serve .
# or
python3 -m http.server 8080
```

Open the URL, open **Settings**, confirm the model, then speak.

## Deploy on GitHub Pages

1. Create a repo, put these files in the root (or `/docs`).
2. Settings → Pages → deploy from branch.
3. Users bring their own free API key (or run Ollama locally against a local copy).

## Credit

Created by S Whorton — Matorikusu 2026 — All rights reserved.

Bust photograph derived from a public-domain museum image of Marcus Aurelius (Glyptothek type), converted to black and white.
