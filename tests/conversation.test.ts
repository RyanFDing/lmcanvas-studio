import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ancestorPath, buildPrompt } from '../src/renderer/src/canvas/conversation.ts'

const msg = (id: string, role: 'user' | 'assistant', content: string) =>
  ({ id, type: 'message', position: { x: 0, y: 0 }, data: { role, content } }) as any
const edge = (source: string, target: string) => ({ id: source + target, source, target })

// u1 → a1 forks into two branches: (u2 → a2) and (u3 → a3). a3 errored and is empty.
const nodes = [
  msg('u1', 'user', 'What is a CRDT?'),
  msg('a1', 'assistant', 'A data structure that merges without conflicts.'),
  msg('u2', 'user', 'Give a JS example'),
  msg('a2', 'assistant', 'Here is a G-Counter...'),
  msg('u3', 'user', 'Compare to OT'),
  msg('a3', 'assistant', ''),
  { id: 's1', type: 'sticky', position: { x: 0, y: 0 }, data: { text: 'note' } } as any
]
const edges = [edge('u1', 'a1'), edge('a1', 'u2'), edge('u2', 'a2'), edge('a1', 'u3'), edge('u3', 'a3')]
const contents = (leaf: string | null, es = edges) => ancestorPath(nodes, es, leaf).map((t) => t.content)

test('returns the branch from root to leaf', () => {
  assert.deepEqual(contents('a2'), [
    'What is a CRDT?',
    'A data structure that merges without conflicts.',
    'Give a JS example',
    'Here is a G-Counter...'
  ])
})

test('sibling branches never see each other, and empty replies are dropped', () => {
  assert.deepEqual(contents('a3'), [
    'What is a CRDT?',
    'A data structure that merges without conflicts.',
    'Compare to OT'
  ])
})

test('a hand-drawn edge that closes a loop does not leak context', () => {
  assert.deepEqual(contents('a3', [...edges, edge('a2', 'u1')]), contents('a3'))
})

test('buildPrompt passes a root prompt through and wraps history otherwise', () => {
  assert.equal(buildPrompt([], 'hi'), 'hi')
  const p = buildPrompt(ancestorPath(nodes, edges, 'a3'), 'And Yjs?')
  assert.ok(p.includes('User: What is a CRDT?'))
  assert.ok(p.endsWith('User: And Yjs?'))
  assert.ok(!p.includes('G-Counter'))
})
