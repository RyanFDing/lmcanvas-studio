import { app } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

// Canvases persist as plain JSON under ~/.lmcanvas-studio/canvases/.
function canvasDir(): string {
  return join(app.getPath('home'), '.lmcanvas-studio', 'canvases')
}

export async function saveCanvas(id: string, data: unknown): Promise<void> {
  const dir = canvasDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(join(dir, `${id}.json`), JSON.stringify(data, null, 2), 'utf-8')
}

export async function loadCanvas(id: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(join(canvasDir(), `${id}.json`), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null // no saved canvas yet
  }
}
