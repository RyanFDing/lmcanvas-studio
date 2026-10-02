// Turns a branch of the canvas into the context Claude sees. Each `claude -p`
// call is stateless, so without this a reply would only ever see the newest
// prompt, not the messages above it on its branch.
import type { Edge } from '@xyflow/react'
import type { AppNode, MessageData } from './types'

export type Turn = MessageData

// Walk parent edges from `leafId` up to the root, returning message turns in
// root → leaf order. Non-message nodes are skipped and empty turns (a reply
// that errored before streaming anything) are dropped.
export function ancestorPath(nodes: AppNode[], edges: Edge[], leafId: string | null): Turn[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const parentOf = new Map<string, string>()
  const reaches = (from: string, target: string): boolean => {
    for (let cur: string | undefined = from; cur; cur = parentOf.get(cur)) if (cur === target) return true
    return false
  }
  // Edges arrive in creation order, so the branch structure comes first. A later
  // hand-drawn edge that would close a loop is ignored rather than letting one
  // branch's messages leak into another's context.
  for (const e of edges) {
    if (!parentOf.has(e.target) && !reaches(e.source, e.target)) parentOf.set(e.target, e.source)
  }

  const path: Turn[] = []
  const seen = new Set<string>()
  let id = leafId
  while (id && !seen.has(id)) {
    seen.add(id)
    const n = byId.get(id)
    if (n?.type === 'message' && n.data.content.trim()) path.push(n.data)
    id = parentOf.get(id) ?? null
  }
  return path.reverse()
}

// Fold the branch history and the new message into a single prompt.
export function buildPrompt(history: Turn[], next: string): string {
  if (history.length === 0) return next
  const transcript = history
    .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content.trim()}`)
    .join('\n\n')
  return (
    'Below is the conversation so far on this branch. Continue it by replying to the ' +
    'final user message. Answer only that message; do not repeat or summarize the transcript.\n\n' +
    `${transcript}\n\nUser: ${next}`
  )
}
