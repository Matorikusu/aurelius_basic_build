/// <reference types="vite/client" />

declare module "kokoro-js" {
  export class KokoroTTS {
    static from_pretrained(
      model_id: string,
      options?: Record<string, unknown>,
    ): Promise<KokoroTTS>;
    generate(text: string, options?: { voice?: string }): Promise<{
      audio?: Float32Array;
      sampling_rate?: number;
      toBlob?: () => Blob;
    }>;
  }
}
