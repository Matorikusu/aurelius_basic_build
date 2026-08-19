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
