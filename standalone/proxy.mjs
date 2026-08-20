import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const GREETING =
  "You have found me at my papers. Sit, if you wish. Speak of what disturbs the mind — or of whatever you came to say.";

loadDotEnv();

export function loadDotEnv() {
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

export function getApiKey(req) {
  const header = String(req.headers.authorization || req.headers.Authorization || "");
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  return process.env.XAI_API_KEY || bearer || "";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function json(res, status, obj) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

async function handleChat(req, res, apiKey) {
  let body;
  try {
    body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  } catch {
    return json(res, 400, { error: "Nothing was said." });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = [];
  for (const m of raw.slice(-24)) {
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
    const content = m.content.trim().slice(0, 4000);
    if (content) messages.push({ role: m.role, content });
  }
  if (!messages.some((m) => m.role === "user")) {
    return json(res, 400, { error: "Speak first, then I will answer." });
  }

  const system = typeof body.system === "string" && body.system.trim() ? body.system : "";
  const max_tokens = Math.min(800, Math.max(120, Number(body.max_tokens) || 380));
  const model = typeof body.model === "string" && body.model.trim() ? body.model : "grok-4.5";

  const payload = [];
  if (system) payload.push({ role: "system", content: system });
  payload.push({ role: "assistant", content: GREETING });
  payload.push(...messages);

  const upstream = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.75,
      max_tokens,
      messages: payload,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    console.error("[chat] xAI error", upstream.status, errText.slice(0, 400));
    return json(res, 502, { error: "Marcus could not be reached." });
  }

  cors(res);
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const decoder = new TextDecoder();
  let buf = "";
  try {
    for await (const chunk of upstream.body) {
      buf += decoder.decode(chunk, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        } catch {
          /* ignore partial json */
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "stream failed";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
  }
  res.end();
}

async function handleSpeak(req, res, apiKey) {
  let body;
  try {
    body = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  } catch {
    return json(res, 400, { error: "Nothing to speak." });
  }
  const text = String(body.text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
  if (!text) return json(res, 400, { error: "Nothing to speak." });
  const allowed = new Set(["lux", "orion", "altair", "perseus"]);
  const voice_id = allowed.has(body.voice_id) ? body.voice_id : "lux";

  const upstream = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ text, voice_id, language: "en" }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("[speak] xAI error", upstream.status, errText.slice(0, 400));
    return json(res, 502, { error: "The voice could not be formed." });
  }

  const audio = Buffer.from(await upstream.arrayBuffer());
  cors(res);
  res.writeHead(200, {
    "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
    "Cache-Control": "no-store",
  });
  res.end(audio);
}

export async function handleApi(req, res) {
  const url = (req.url || "/").split("?")[0];
  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return true;
  }
  if (url === "/api/health" && req.method === "GET") {
    json(res, 200, { ok: true, hasKey: Boolean(process.env.XAI_API_KEY) });
    return true;
  }
  if (url === "/api/chat" && req.method === "POST") {
    const key = getApiKey(req);
    if (!key) return json(res, 401, { error: "Add an xAI API key in Settings." }), true;
    await handleChat(req, res, key);
    return true;
  }
  if (url === "/api/speak" && req.method === "POST") {
    const key = getApiKey(req);
    if (!key) return json(res, 401, { error: "Add an xAI API key in Settings." }), true;
    await handleSpeak(req, res, key);
    return true;
  }
  return false;
}

export function aureliusApiPlugin() {
  return {
    name: "aurelius-api",
    configureServer(server) {
      loadDotEnv();
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApi(req, res);
          if (!handled) next();
        } catch (err) {
          console.error(err);
          if (!res.headersSent) json(res, 500, { error: "The line was cut." });
        }
      });
    },
  };
}
