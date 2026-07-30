// Pure parser for `claude --output-format stream-json --verbose` JSONL output.
// Kept dependency-free so it can be unit-tested against recorded CLI output.

export type StreamOut = { kind: 'delta'; text: string } | { kind: 'done'; text: string }

export type StreamState = { hadDelta: boolean; full: string }

export function newStreamState(): StreamState {
  return { hadDelta: false, full: '' }
}

// Parse a single JSONL line. Returns an emission or null.
// - `stream_event` text_delta → incremental token (preferred when --include-partial-messages is on)
// - `assistant` message → full text, used only if no deltas streamed (avoids duplication)
// - `result` → terminal event carrying the final text
export function parseLine(line: string, state: StreamState): StreamOut | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  let evt: any
  try {
    evt = JSON.parse(trimmed)
  } catch {
    return null // partial/incomplete JSON line — wait for more
  }

  if (evt.type === 'stream_event') {
    const inner = evt.event
    if (inner?.type === 'content_block_delta' && inner.delta?.type === 'text_delta') {
      state.hadDelta = true
      state.full += inner.delta.text
      return { kind: 'delta', text: inner.delta.text }
    }
    return null
  }

  if (evt.type === 'assistant' && Array.isArray(evt.message?.content)) {
    const text = evt.message.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('')
    if (!state.hadDelta && text) {
      state.full += text
      return { kind: 'delta', text }
    }
    return null
  }

  if (evt.type === 'result') {
    const final = typeof evt.result === 'string' ? evt.result : state.full
    return { kind: 'done', text: final }
  }

  return null
}
