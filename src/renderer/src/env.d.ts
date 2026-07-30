/// <reference types="vite/client" />

export interface LmApi {
  ai: {
    start: (requestId: string, prompt: string) => void
    onChunk: (cb: (p: { requestId: string; delta: string }) => void) => () => void
    onDone: (cb: (p: { requestId: string; text: string }) => void) => () => void
    onError: (cb: (p: { requestId: string; message: string }) => void) => () => void
  }
  storage: {
    save: (id: string, data: unknown) => Promise<void>
    load: (id: string) => Promise<unknown | null>
  }
}

declare global {
  interface Window {
    api?: LmApi
  }
}
