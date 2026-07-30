import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { runClaude } from './ai'
import { saveCanvas, loadCanvas } from './storage'

// ---- IPC: AI streaming + canvas persistence ----
ipcMain.on('ai:start', (event, payload: { requestId: string; prompt: string }) => {
  runClaude(event.sender, payload.requestId, payload.prompt)
})
ipcMain.handle('storage:save', (_e, p: { id: string; data: unknown }) => saveCanvas(p.id, p.data))
ipcMain.handle('storage:load', (_e, p: { id: string }) => loadCanvas(p.id))

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    title: 'lmcanvas-studio',
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in the user's browser, not inside the app.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // In dev, electron-vite serves the renderer over HTTP; in prod, load the built file.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // macOS: re-create a window when the dock icon is clicked and none are open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // macOS apps typically stay active until the user quits explicitly.
  if (process.platform !== 'darwin') app.quit()
})
