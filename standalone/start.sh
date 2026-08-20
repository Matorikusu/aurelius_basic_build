#!/bin/bash
cd "$(dirname "$0")"
echo
echo " Aurelius"
echo " Created by S Whorton - Matorikusu 2026"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is missing. Install LTS from https://nodejs.org then run this again."
  open "https://nodejs.org" 2>/dev/null || xdg-open "https://nodejs.org" 2>/dev/null || true
  exit 1
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama is missing. It is a free app — not a plugin, not GitHub."
  echo "Opening https://ollama.com — install it, open it, then run this again."
  open "https://ollama.com" 2>/dev/null || xdg-open "https://ollama.com" 2>/dev/null || true
  exit 1
fi

echo "Making sure llama3.2 is installed (first time ~2 GB)..."
if ! ollama pull llama3.2; then
  echo "Could not pull the model. Is the Ollama app open?"
  exit 1
fi

echo
echo "Starting the chamber at http://localhost:8080"
echo "Keep this window open. Press Ctrl+C to stop."
echo
exec node server.mjs
