import { contextBridge } from 'electron'

// The bridge between the sandboxed renderer and the Node-powered main process.
// M2+ will expose AI (spawn `claude`) and storage APIs here.
const api = {}

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
