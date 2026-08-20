const PROFILES: Record<string, { rate: number; pitch: number; pick: RegExp }> = {
  lux: { rate: 0.88, pitch: 0.84, pick: /david|daniel|george|arthur|guy|mark|andrew|ryan/i },
  orion: { rate: 0.9, pitch: 0.78, pick: /daniel|arthur|james|mark|david|male/i },
  altair: { rate: 0.96, pitch: 0.94, pick: /google us|alex|tom|matthew|male/i },
  perseus: { rate: 0.92, pitch: 0.86, pick: /microsoft|david|fred|george|male/i },
};

let kept: SpeechSynthesisUtterance[] = [];
let voicesReady: Promise<void> | null = null;

export function stopAudio() {
  kept = [];
  if (typeof speechSynthesis !== "undefined") {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

export function unlockSpeech() {
  if (typeof speechSynthesis === "undefined") return;
  try {
    speechSynthesis.getVoices();
    speechSynthesis.resume();
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    kept.push(warm);
    speechSynthesis.speak(warm);
    speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

function waitForVoices(): Promise<void> {
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    if (typeof speechSynthesis === "undefined") {
      resolve();
      return;
    }
    const done = () => resolve();
    if (speechSynthesis.getVoices().length) {
      resolve();
      return;
    }
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 1500);
  });
  return voicesReady;
}

function pickVoice(voiceId: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /^en\b/i.test(v.lang) || /english/i.test(v.name));
  const pool = en.length ? en : voices;
  const re = PROFILES[voiceId]?.pick;
  if (re) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return (
    pool.find((v) => /microsoft (david|mark|george|guy)|daniel|arthur|alex|fred/i.test(v.name)) ??
    pool.find((v) => /en-GB|en-US/i.test(v.lang)) ??
    pool[0] ??
    null
  );
}

function chunkText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > 220 && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.filter(Boolean);
}

function speakChunk(text: string, voiceId: string): Promise<void> {
  const profile = PROFILES[voiceId] ?? PROFILES.lux;
  return new Promise((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(text);
    kept.push(utter);
    utter.rate = profile.rate;
    utter.pitch = profile.pitch;
    utter.lang = "en-US";
    const voice = pickVoice(voiceId);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang || "en-US";
    }
    utter.onend = () => resolve();
    utter.onerror = (ev) => {
      const type = (ev as SpeechSynthesisErrorEvent).error;
      if (type === "interrupted" || type === "canceled") resolve();
      else reject(new Error("The voice faltered. Check that your computer has English voices enabled."));
    };
    speechSynthesis.resume();
    speechSynthesis.speak(utter);
  });
}

export async function speakBrowser(text: string, voiceId = "lux"): Promise<void> {
  if (!text.trim()) return;
  if (typeof speechSynthesis === "undefined") {
    throw new Error("This browser has no spoken voice. Try Chrome or Edge.");
  }
  await waitForVoices();
  stopAudio();
  await new Promise((r) => window.setTimeout(r, 50));
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    await speakChunk(chunk, voiceId);
  }
}

export function browserSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
