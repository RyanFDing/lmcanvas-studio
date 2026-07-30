import { spawn } from 'child_process'
import type { WebContents } from 'electron'
import { parseLine, newStreamState } from './claudeStream'

// Spawn the local `claude` CLI and stream its reply back to the renderer.
// No API key: relies on the user's existing Claude Code authentication.
export function runClaude(sender: WebContents, requestId: string, prompt: string): void {
  const child = spawn(
    'claude',
    ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--include-partial-messages'],
    { env: process.env }
  )

  const state = newStreamState()
  let buffer = ''

  child.stdout.on('data', (data: Buffer) => {
    buffer += data.toString()
    let nl: number
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl)
      buffer = buffer.slice(nl + 1)
      const out = parseLine(line, state)
      if (!out) continue
      if (out.kind === 'delta') sender.send('ai:chunk', { requestId, delta: out.text })
      else sender.send('ai:done', { requestId, text: out.text })
    }
  })

  child.stderr.on('data', (d: Buffer) => console.error('[claude]', d.toString()))

  child.on('error', (err) => {
    sender.send('ai:error', {
      requestId,
      message: `Could not start claude CLI (${err.message}). Is Claude Code installed and on PATH?`
    })
  })

  child.on('close', (code) => {
    if (code !== 0) sender.send('ai:error', { requestId, message: `claude exited with code ${code}` })
  })
}
