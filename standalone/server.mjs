#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const clean = decodeURIComponent((urlPath || "/").split("?")[0]);
  const resolved = normalize(join(DIST, clean));
  if (!resolved.startsWith(DIST)) return null;
  return resolved;
}

function sendFile(res, file) {
  const type = TYPES[extname(file).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
  res.end(readFileSync(file));
}

if (!existsSync(join(DIST, "index.html"))) {
  console.error("No dist/ folder yet. Run:  npm install && npm run build && npm start");
  process.exit(1);
}

const server = createServer((req, res) => {
  try {
    const urlPath = (req.url || "/").split("?")[0];
    const file = safePath(urlPath === "/" ? "/index.html" : urlPath);
    if (file && existsSync(file) && statSync(file).isFile()) {
      sendFile(res, file);
      return;
    }
    sendFile(res, join(DIST, "index.html"));
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("The line was cut.");
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Aurelius is running at http://localhost:${PORT}`);
  console.log("Free. On-device. No API key.");
});
