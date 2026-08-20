let current: HTMLAudioElement | null = null;
let objectUrl: string | null = null;

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
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
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

function pickBrowserVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /en[-_]/i.test(v.lang) || /english/i.test(v.name));
  const pool = en.length ? en : voices;
  const male =
    pool.find((v) => /male|daniel|david|george|arthur|alex|fred|tom/i.test(v.name)) ?? pool[0];
  return male ?? null;
}

export function speakBrowser(text: string): Promise<void> {
  stopAudio();
  if (!text.trim() || typeof speechSynthesis === "undefined") {
    return Promise.reject(new Error("This browser has no spoken voice."));
  }
  return new Promise((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 0.92;
    const voice = pickBrowserVoice();
    if (voice) utter.voice = voice;
    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("The voice faltered."));
    speechSynthesis.speak(utter);
  });
}

export function browserSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
