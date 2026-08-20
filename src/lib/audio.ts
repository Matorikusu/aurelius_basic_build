let current: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let kept: SpeechSynthesisUtterance[] = [];

const PROFILES: Record<string, { rate: number; pitch: number; pick: RegExp }> = {
  lux: { rate: 0.88, pitch: 0.84, pick: /david|daniel|george|arthur|guy|mark|andrew|ryan/i },
  orion: { rate: 0.9, pitch: 0.78, pick: /daniel|arthur|james|mark|david|male/i },
  altair: { rate: 0.96, pitch: 0.94, pick: /google us|alex|tom|matthew|male/i },
  perseus: { rate: 0.92, pitch: 0.86, pick: /microsoft|david|fred|george|male/i },
};

export function stopAudio() {
  if (current) {
    current.pause();
    current.onended = null;
    current.onerror = null;
    current.src = "";
    current = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  kept = [];
  if (typeof speechSynthesis !== "undefined") {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

export function playBlob(blob: Blob): Promise<void> {
  stopAudio();
  const url = URL.createObjectURL(blob);
  objectUrl = url;
  const audio = new Audio(url);
  current = audio;
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      stopAudio();
      resolve();
    };
    audio.onerror = () => {
      stopAudio();
      reject(new Error("The voice faltered."));
    };
    void audio.play().catch((err: unknown) => {
      stopAudio();
      reject(err instanceof Error ? err : new Error("Could not play."));
    });
  });
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

export async function speakBrowser(text: string, voiceId = "lux"): Promise<void> {
  if (!text.trim()) return;
  if (typeof speechSynthesis === "undefined") {
    throw new Error("This browser has no spoken voice. Try Chrome or Edge.");
  }
  await new Promise<void>((resolve) => {
    if (speechSynthesis.getVoices().length) {
      resolve();
      return;
    }
    speechSynthesis.addEventListener("voiceschanged", () => resolve(), { once: true });
    window.setTimeout(() => resolve(), 1500);
  });
  stopAudio();
  await new Promise((r) => window.setTimeout(r, 50));
  const profile = PROFILES[voiceId] ?? PROFILES.lux;
  for (const chunk of chunkText(text)) {
    await new Promise<void>((resolve, reject) => {
      const utter = new SpeechSynthesisUtterance(chunk);
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
        else reject(new Error("The voice faltered. Use Chrome or Edge."));
      };
      speechSynthesis.resume();
      speechSynthesis.speak(utter);
    });
  }
}
