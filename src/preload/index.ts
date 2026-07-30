import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

// Subscribe to a main→renderer channel; returns an unsubscribe function.
function sub<T>(channel: string, cb: (payload: T) => void): () => void {
  const handler = (_e: IpcRendererEvent, payload: T): void => cb(payload)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

const api = {
  ai: {
    start: (requestId: string, prompt: string): void =>
      ipcRenderer.send('ai:start', { requestId, prompt }),
    onChunk: (cb: (p: { requestId: string; delta: string }) => void) => sub('ai:chunk', cb),
    onDone: (cb: (p: { requestId: string; text: string }) => void) => sub('ai:done', cb),
    onError: (cb: (p: { requestId: string; message: string }) => void) => sub('ai:error', cb)
  },
  storage: {
    save: (id: string, data: unknown): Promise<void> =>
      ipcRenderer.invoke('storage:save', { id, data }),
    load: (id: string): Promise<unknown | null> => ipcRenderer.invoke('storage:load', { id })
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore — fallback when context isolation is disabled
  window.api = api
}
