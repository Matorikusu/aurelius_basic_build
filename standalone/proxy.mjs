const OLLAMA = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");

const PREFERRED = [
  "llama3.2",
  "llama3.2:3b",
  "llama3.2:1b",
  "llama3.1",
  "llama3.1:8b",
  "phi4",
  "phi3",
  "qwen2.5:3b",
  "qwen2.5",
  "mistral",
  "gemma2:2b",
  "gemma2",
];

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function pickModel(names) {
  if (!names.length) return null;
  for (const want of PREFERRED) {
    const hit = names.find(
      (n) => n === want || n === `${want}:latest` || n.startsWith(`${want}:`) || n.replace(/:latest$/, "") === want,
    );
    if (hit) return hit;
  }
  return names[0];
}

async function listModels() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1500);
  try {
    const res = await fetch(`${OLLAMA}/api/tags`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
    const data = await res.json();
    return (data.models || []).map((m) => m.name).filter(Boolean);
  } finally {
    clearTimeout(t);
  }
}

async function health() {
  try {
    const models = await listModels();
    const model = pickModel(models);
    return {
      ok: true,
      backend: model ? "ollama" : "ollama-empty",
      ollama: true,
      model,
      models,
      hint: model
        ? `Using ${model} on this computer.`
        : "Ollama is running, but no model is installed. In a terminal: ollama pull llama3.2",
    };
  } catch {
    return {
      ok: true,
      backend: "none",
      ollama: false,
      model: null,
      models: [],
      hint: "Install Ollama from ollama.com (free), then run: ollama pull llama3.2",
    };
  }
}

async function streamChat(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    json(res, 400, { error: "The request was not understood." });
    return;
  }

  const status = await health();
  if (!status.ollama) {
    json(res, 503, {
      error:
        "Ollama is not running. Install it from https://ollama.com (free), open it, then run: ollama pull llama3.2",
    });
    return;
  }
  if (!status.model) {
    json(res, 503, {
      error: "Ollama is running, but no model is installed. In a terminal: ollama pull llama3.2",
    });
    return;
  }

  const messages = [];
  if (payload.system) messages.push({ role: "system", content: String(payload.system) });
  for (const m of payload.messages || []) {
    if (m?.role === "user" || m?.role === "assistant") {
      messages.push({ role: m.role, content: String(m.content || "") });
    }
  }

  let ollamaRes;
  try {
    ollamaRes = await fetch(`${OLLAMA}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: status.model,
        messages,
        stream: true,
        options: {
          temperature: 0.75,
          num_predict: Number(payload.max_tokens) || 380,
        },
      }),
    });
  } catch {
    json(res, 503, { error: "Could not reach Ollama at localhost:11434. Open the Ollama app and try again." });
    return;
  }

  if (!ollamaRes.ok) {
    const body = await ollamaRes.text();
    let msg = `Ollama returned ${ollamaRes.status}.`;
    try {
      const parsed = JSON.parse(body);
      if (parsed.error) msg = parsed.error;
    } catch {
      if (body) msg = body.slice(0, 240);
    }
    json(res, 502, { error: msg });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const reader = ollamaRes.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const evt = JSON.parse(trimmed);
          const delta = evt?.message?.content;
          if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        } catch {
          /* skip partial */
        }
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "The line was cut." })}\n\n`);
      res.end();
    }
  }
}

export async function handleApi(req, res) {
  const url = (req.url || "").split("?")[0];
  if (req.method === "GET" && url === "/api/health") {
    json(res, 200, await health());
    return true;
  }
  if (req.method === "POST" && url === "/api/chat") {
    await streamChat(req, res);
    return true;
  }
  return false;
}

export function aureliusApiPlugin() {
  return {
    name: "aurelius-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (await handleApi(req, res)) return;
        } catch (err) {
          if (!res.headersSent) json(res, 500, { error: err instanceof Error ? err.message : "Server error" });
          return;
        }
        next();
      });
    },
  };
}
