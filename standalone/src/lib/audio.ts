const PROFILES: Record<string, { rate: number; pitch: number; pick: RegExp }> = {
  lux: { rate: 0.88, pitch: 0.84, pick: /daniel|george|arthur|male|david/i },
  orion: { rate: 0.9, pitch: 0.78, pick: /daniel|arthur|james|male/i },
  altair: { rate: 0.96, pitch: 0.94, pick: /daniel|alex|tom|male/i },
  perseus: { rate: 0.92, pitch: 0.86, pick: /david|fred|male|george/i },
};

export function stopAudio() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

function pickVoice(voiceId: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /en[-_]/i.test(v.lang) || /english/i.test(v.name));
  const pool = en.length ? en : voices;
  const re = PROFILES[voiceId]?.pick;
  if (re) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return pool.find((v) => /male|daniel|david|george|arthur/i.test(v.name)) ?? pool[0] ?? null;
}

export function speakBrowser(text: string, voiceId = "lux"): Promise<void> {
  stopAudio();
  if (!text.trim() || typeof speechSynthesis === "undefined") {
    return Promise.reject(new Error("This browser has no spoken voice."));
  }
  const profile = PROFILES[voiceId] ?? PROFILES.lux;
  return new Promise((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = profile.rate;
    utter.pitch = profile.pitch;
    const voice = pickVoice(voiceId);
    if (voice) utter.voice = voice;
    utter.onend = () => resolve();
    utter.onerror = () => reject(new Error("The voice faltered."));
    // Chrome often has an empty voice list until this event.
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        const late = pickVoice(voiceId);
        if (late) utter.voice = late;
        speechSynthesis.speak(utter);
      };
      return;
    }
    speechSynthesis.speak(utter);
  });
}

export function browserSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
