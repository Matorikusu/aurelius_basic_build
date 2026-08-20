(() => {
  "use strict";

  const GREETING =
    "You have found me at my papers. Sit, if you wish. Speak of what disturbs the mind — or of whatever you came to say.";

  const VOICES = [
    { id: "lux", name: "Lux", quality: "Grounded, quietly wise" },
    { id: "orion", name: "Orion", quality: "Rich and resonant" },
    { id: "altair", name: "Altair", quality: "Refined, even" },
    { id: "perseus", name: "Perseus", quality: "Steady, trustworthy" },
  ];

  const PROVIDERS = {
    ollama: {
      baseUrl: "http://localhost:11434/v1",
      model: "llama3.2",
      needsKey: false,
    },
    groq: {
      baseUrl: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
      needsKey: true,
    },
    openrouter: {
      baseUrl: "https://openrouter.ai/api/v1",
      model: "meta-llama/llama-3.2-3b-instruct:free",
      needsKey: true,
    },
    custom: {
      baseUrl: "",
      model: "",
      needsKey: true,
    },
  };

  const DEFAULTS = {
    voiceId: "lux",
    register: "counsel",
    austerity: 58,
    brevity: 62,
    autoSpeak: false,
    provider: "ollama",
    baseUrl: PROVIDERS.ollama.baseUrl,
    apiKey: "",
    modelId: PROVIDERS.ollama.model,
  };

  // ——— state ———
  let prefs = loadPrefs();
  let messages = [];
  let streaming = false;
  let speaking = false;
  let recording = false;
  let abortCtrl = null;
  let mediaRec = null;
  let recognition = null;

  const $ = (sel) => document.querySelector(sel);
  const thread = $("#thread");
  const input = $("#input");
  const sendBtn = $("#sendBtn");
  const micBtn = $("#micBtn");
  const settings = $("#settings");
  const bustGlow = $("#bustGlow");

  // ——— prefs ———
  function loadPrefs() {
    try {
      const raw = localStorage.getItem("aurelius.prefs");
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function savePrefs() {
    localStorage.setItem("aurelius.prefs", JSON.stringify(prefs));
  }

  // ——— system prompt ———
  function buildSystemPrompt() {
    const reg =
      prefs.register === "journal"
        ? "Register: private notes. Speak partly as if writing to yourself."
        : prefs.register === "emperor"
          ? "Register: imperial counsel. Firmer, duty-aware, still a philosopher."
          : "Register: counsel to a fellow human being. Direct, grave, without flattery.";

    const aust =
      prefs.austerity < 35
        ? "Temper: gentle but honest."
        : prefs.austerity < 70
          ? "Temper: even — name the fault, leave them their freedom."
          : "Temper: austere. Strip excuses. No theatrical severity.";

    const brev =
      prefs.brevity < 35
        ? "Cadence: a few short paragraphs."
        : prefs.brevity < 70
          ? "Cadence: compact — one or two movements of thought."
          : "Cadence: aphoristic. A few sentences. Stop when the point is made.";

    return `You are Marcus Aurelius Antoninus, Roman emperor, speaking as in your private notes (Meditations). It is late in your reign, about 180 CE, on campaign near the Danube. You are a man, not a god, not a modern commentator.

You think as a Stoic: virtue is the only good; judgment, impulse, desire, and aversion are up to you; the rest is indifferent. You address the visitor as a fellow citizen of the cosmos.

What you know: the Roman world of the second century, Greek philosophy (Epictetus, Plato, the Porch), your tutors, wars, the plague, your family as of your lifetime. You may echo the grain of your notes in clear English.

What you do not know: events after your death, the Americas, electricity, the internet, modern nations, later religions as empires, AI, psychology as a profession. If asked about such things, say plainly that this is not of your time, then reason from first principles. Never break character with talk of models, prompts, or being an AI.

Speak in clear, grave contemporary English — intimate, not archaic. No markdown, no bullet lists, no emoji. Short sentences; occasional longer ones.

${reg}
${aust}
${brev}`;
  }

  function maxTokens() {
    if (prefs.brevity >= 75) return 220;
    if (prefs.brevity >= 50) return 380;
    if (prefs.brevity >= 28) return 520;
    return 700;
  }

  // ——— render ———
  function renderThread() {
    if (messages.length === 0) {
      thread.innerHTML = `
        <div class="empty">
          <img src="marcus-bust-tight-v2.jpg" alt="" class="bust-empty" />
          <h2>Marcus Aurelius</h2>
          <p>${escapeHtml(GREETING)}</p>
        </div>`;
      return;
    }

    const parts = messages
      .map((m) => {
        if (m.role === "user") {
          return `<div class="msg user"><div class="bubble">${escapeHtml(m.content)}</div></div>`;
        }
        const actions =
          m.content && !m.streaming
            ? `<div class="actions"><button type="button" data-speak="${m.id}">Hear him</button></div>`
            : "";
        const cursor = m.streaming ? `<span class="cursor"></span>` : "";
        return `<div class="msg assistant">
          <img class="avatar" src="marcus-bust-tight-v2.jpg" alt="" />
          <div class="body">
            <p class="who">Marcus</p>
            <p class="text">${escapeHtml(m.content)}${cursor}</p>
            ${actions}
          </div>
        </div>`;
      })
      .join("");

    thread.innerHTML = `<div class="thread-inner">${parts}</div>`;
    thread.scrollTop = thread.scrollHeight;

    thread.querySelectorAll("[data-speak]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-speak");
        const msg = messages.find((x) => x.id === id);
        if (msg) speak(msg.content);
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  // ——— chat ———
  async function send(text) {
    const content = text.replace(/\s+/g, " ").trim();
    if (!content || streaming) return;

    stopSpeak();
    input.value = "";
    autosize();
    updateSend();

    const userMsg = { id: uid(), role: "user", content };
    const asstMsg = { id: uid(), role: "assistant", content: "", streaming: true };
    messages.push(userMsg, asstMsg);
    renderThread();
    streaming = true;
    sendBtn.disabled = true;

    const payload = {
      model: prefs.modelId || "llama3.2",
      stream: true,
      temperature: 0.75,
      max_tokens: maxTokens(),
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "assistant", content: GREETING },
        ...messages
          .filter((m) => !m.streaming || m.content)
          .filter((m) => m.id !== asstMsg.id)
          .map((m) => ({ role: m.role, content: m.content })),
      ],
    };

    abortCtrl = new AbortController();
    const headers = {
      "Content-Type": "application/json",
    };
    if (prefs.apiKey) headers.Authorization = `Bearer ${prefs.apiKey}`;
    if (prefs.provider === "openrouter") {
      headers["HTTP-Referer"] = location.origin;
      headers["X-Title"] = "Aurelius";
    }

    try {
      const res = await fetch(`${prefs.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(parseErr(res.status, errText));
      }

      if (!res.body) throw new Error("No response stream.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.text || "";
            if (delta) {
              full += delta;
              asstMsg.content = full;
              renderThread();
            }
          } catch {
            /* ignore partial */
          }
        }
      }

      asstMsg.content = full.trim() || asstMsg.content;
      asstMsg.streaming = false;
      renderThread();
      if (prefs.autoSpeak && asstMsg.content) speak(asstMsg.content);
    } catch (err) {
      if (err.name === "AbortError") return;
      asstMsg.content =
        asstMsg.content ||
        `I am silent a moment. (${err.message || "The line was cut."}) Open Settings and check your model.`;
      asstMsg.streaming = false;
      renderThread();
    } finally {
      streaming = false;
      abortCtrl = null;
      updateSend();
    }
  }

  function parseErr(status, body) {
    if (status === 401) return "API key rejected.";
    if (status === 404) return "Endpoint not found — check Base URL and that Ollama is running.";
    if (status === 0 || status === undefined) return "Could not reach the model (network or CORS).";
    try {
      const j = JSON.parse(body);
      return j.error?.message || j.message || `Error ${status}`;
    } catch {
      return body?.slice(0, 120) || `Error ${status}`;
    }
  }

  // ——— speech (browser TTS) ———
  function pickSystemVoice(voiceId) {
    const list = speechSynthesis.getVoices();
    if (!list.length) return null;
    const prefer = {
      lux: [/daniel/i, /samantha/i, /alex/i, /karen/i, /en-gb/i, /en-us/i],
      orion: [/arthur/i, /rishi/i, /daniel/i, /en-gb/i],
      altair: [/martha/i, /moira/i, /samantha/i, /en-gb/i],
      perseus: [/daniel/i, /alex/i, /en-us/i, /en-gb/i],
    };
    const patterns = prefer[voiceId] || prefer.lux;
    for (const re of patterns) {
      const hit = list.find((v) => re.test(v.name) || re.test(v.lang));
      if (hit) return hit;
    }
    return list.find((v) => /^en/i.test(v.lang)) || list[0];
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    stopSpeak();
    const u = new SpeechSynthesisUtterance(text.slice(0, 1200));
    const v = pickSystemVoice(prefs.voiceId);
    if (v) u.voice = v;
    const rates = { lux: 0.92, orion: 0.88, altair: 0.95, perseus: 0.9 };
    const pitches = { lux: 0.95, orion: 0.85, altair: 1.05, perseus: 0.9 };
    u.rate = rates[prefs.voiceId] || 0.92;
    u.pitch = pitches[prefs.voiceId] || 1;
    u.onstart = () => {
      speaking = true;
      bustGlow.hidden = false;
    };
    u.onend = u.onerror = () => {
      speaking = false;
      bustGlow.hidden = true;
    };
    speechSynthesis.speak(u);
  }

  function stopSpeak() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    speaking = false;
    bustGlow.hidden = true;
  }

  function previewVoice(id) {
    const prev = prefs.voiceId;
    prefs.voiceId = id;
    speak("You have power over your mind, not outside events.");
    prefs.voiceId = prev;
  }

  // ——— mic (Web Speech API) ———
  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not available in this browser.");
      return;
    }
    if (recording && recognition) {
      recognition.stop();
      return;
    }
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => {
      recording = true;
      micBtn.classList.add("recording");
    };
    recognition.onend = () => {
      recording = false;
      micBtn.classList.remove("recording");
      recognition = null;
    };
    recognition.onerror = () => {
      recording = false;
      micBtn.classList.remove("recording");
    };
    recognition.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) {
        input.value = (input.value ? input.value + " " : "") + final.trim();
        autosize();
        updateSend();
      }
    };
    recognition.start();
  }

  // ——— settings UI ———
  function openSettings() {
    syncSettingsForm();
    settings.showModal();
  }

  function syncSettingsForm() {
    $("#austerity").value = prefs.austerity;
    $("#brevity").value = prefs.brevity;
    $("#autoSpeak").checked = prefs.autoSpeak;
    $("#provider").value = prefs.provider;
    $("#baseUrl").value = prefs.baseUrl;
    $("#apiKey").value = prefs.apiKey;
    $("#modelId").value = prefs.modelId;
    document.querySelectorAll("#registerSeg button").forEach((b) => {
      b.classList.toggle("on", b.dataset.register === prefs.register);
    });
    renderVoiceList();
  }

  function renderVoiceList() {
    const el = $("#voiceList");
    el.innerHTML = VOICES.map(
      (v) => `
      <div class="voice-item ${v.id === prefs.voiceId ? "on" : ""}" data-voice="${v.id}">
        <button type="button" class="pick">
          <span class="v-name">${v.name}</span>
          <span class="v-desc">${v.quality}</span>
        </button>
        <button type="button" class="preview" data-preview="${v.id}" title="Preview" aria-label="Preview ${v.name}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
      </div>`,
    ).join("");

    el.querySelectorAll(".voice-item").forEach((row) => {
      row.querySelector(".pick").addEventListener("click", () => {
        prefs.voiceId = row.dataset.voice;
        savePrefs();
        renderVoiceList();
      });
      row.querySelector(".preview").addEventListener("click", (e) => {
        e.stopPropagation();
        previewVoice(row.dataset.voice);
      });
    });
  }

  function bindSettings() {
    document.querySelectorAll("#registerSeg button").forEach((b) => {
      b.addEventListener("click", () => {
        prefs.register = b.dataset.register;
        savePrefs();
        document.querySelectorAll("#registerSeg button").forEach((x) => x.classList.toggle("on", x === b));
      });
    });
    $("#austerity").addEventListener("input", (e) => {
      prefs.austerity = Number(e.target.value);
      savePrefs();
    });
    $("#brevity").addEventListener("input", (e) => {
      prefs.brevity = Number(e.target.value);
      savePrefs();
    });
    $("#autoSpeak").addEventListener("change", (e) => {
      prefs.autoSpeak = e.target.checked;
      savePrefs();
    });
    $("#provider").addEventListener("change", (e) => {
      prefs.provider = e.target.value;
      const p = PROVIDERS[prefs.provider];
      if (p) {
        if (p.baseUrl) {
          prefs.baseUrl = p.baseUrl;
          $("#baseUrl").value = p.baseUrl;
        }
        if (p.model) {
          prefs.modelId = p.model;
          $("#modelId").value = p.model;
        }
      }
      savePrefs();
    });
    $("#baseUrl").addEventListener("change", (e) => {
      prefs.baseUrl = e.target.value.trim();
      savePrefs();
    });
    $("#apiKey").addEventListener("change", (e) => {
      prefs.apiKey = e.target.value.trim();
      savePrefs();
    });
    $("#modelId").addEventListener("change", (e) => {
      prefs.modelId = e.target.value.trim();
      savePrefs();
    });
  }

  // ——— composer ———
  function autosize() {
    input.style.height = "0px";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  }

  function updateSend() {
    sendBtn.disabled = streaming || !input.value.trim();
  }

  // ——— events ———
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  input.addEventListener("input", () => {
    autosize();
    updateSend();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) send(input.value);
    }
  });

  micBtn.addEventListener("click", toggleMic);
  $("#newChat").addEventListener("click", () => {
    if (abortCtrl) abortCtrl.abort();
    stopSpeak();
    messages = [];
    streaming = false;
    renderThread();
    updateSend();
  });
  $("#openSettings").addEventListener("click", openSettings);
  const railBtn = $("#openSettingsRail");
  if (railBtn) railBtn.addEventListener("click", openSettings);

  // load voices for TTS
  if (window.speechSynthesis) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  bindSettings();
  renderThread();
  updateSend();
})();
