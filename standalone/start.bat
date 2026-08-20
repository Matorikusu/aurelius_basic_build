@echo off
cd /d "%~dp0"
echo.
echo  Aurelius
echo  Created by S Whorton - Matorikusu 2026
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is missing. Install LTS from https://nodejs.org then run this again.
  start https://nodejs.org
  pause
  exit /b 1
)

where ollama >nul 2>&1
if errorlevel 1 (
  echo Ollama is missing. It is a free app - not a plugin, not GitHub.
  echo Opening https://ollama.com  - install it, open it, then run this file again.
  start https://ollama.com
  pause
  exit /b 1
)

echo Making sure llama3.2 is installed (first time ~2 GB)...
ollama pull llama3.2
if errorlevel 1 (
  echo Could not pull the model. Is the Ollama app open?
  pause
  exit /b 1
)

echo.
echo Starting the chamber at http://localhost:8080
echo Keep this window open. Press Ctrl+C to stop.
echo.
node server.mjs
pause
