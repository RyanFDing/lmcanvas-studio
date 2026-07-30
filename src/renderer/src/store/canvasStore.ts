import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Edge
} from '@xyflow/react'
import type { AppNode, MessageNodeType } from '../canvas/types'

const CANVAS_ID = 'default'

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const initialNodes: AppNode[] = [
  {
    id: 'seed-1',
    type: 'message',
    position: { x: 0, y: 0 },
    data: { role: 'user', content: 'What is physical AI, in one line?' }
  },
  {
    id: 'seed-2',
    type: 'message',
    position: { x: 40, y: 200 },
    data: {
      role: 'assistant',
      content: 'AI that perceives and acts in the physical world through robots and sensors.'
    }
  }
]
const initialEdges: Edge[] = [{ id: 'e-seed', source: 'seed-1', target: 'seed-2' }]

type CanvasState = {
  nodes: AppNode[]
  edges: Edge[]
  selectedId: string | null
  streamingId: string | null
  composerSeed: string
  paletteOpen: boolean
  focusId: string | null
  focusNonce: number
  fitAllNonce: number

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (c: Connection) => void
  setSelected: (id: string | null) => void
  setComposerSeed: (text: string) => void
  setPaletteOpen: (open: boolean) => void

  sendPrompt: (text: string) => void
  branchFromSelection: (nodeId: string, quote: string) => void

  addSticky: () => void
  addFrame: () => void
  updateSticky: (id: string, text: string) => void
  newThread: () => void

  exportMarkdown: () => void
  requestFitAll: () => void

  persist: () => void
  hydrate: () => Promise<void>
}

export const useCanvasStore = create<CanvasState>((set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const scheduleSave = (): void => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => get().persist(), 500)
  }

  const requestFocus = (id: string): void =>
    set({ focusId: id, focusNonce: get().focusNonce + 1 })

  // Anchor new elements near the selected node, else near the origin.
  const anchor = (): { x: number; y: number } => {
    const { selectedId, nodes } = get()
    const sel = selectedId ? nodes.find((n) => n.id === selectedId) : null
    return sel ? sel.position : { x: 0, y: 0 }
  }

  const appendTo = (id: string, delta: string): void =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id && n.type === 'message'
          ? { ...n, data: { ...n.data, content: n.data.content + delta } }
          : n
      )
    })

  const stream = (targetId: string, prompt: string): void => {
    const requestId = uid()
    const finish = (): void => {
      set({ streamingId: null })
      scheduleSave()
    }

    if (window.api?.ai) {
      const offChunk = window.api.ai.onChunk((p) => {
        if (p.requestId === requestId) appendTo(targetId, p.delta)
      })
      const offDone = window.api.ai.onDone((p) => {
        if (p.requestId !== requestId) return
        offChunk()
        offDone()
        offErr()
        finish()
      })
      const offErr = window.api.ai.onError((p) => {
        if (p.requestId !== requestId) return
        appendTo(targetId, `\n\n⚠️ ${p.message}`)
        offChunk()
        offDone()
        offErr()
        finish()
      })
      window.api.ai.start(requestId, prompt)
    } else {
      const canned =
        'Physical AI is intelligence embodied in machines that sense and act in the real world — robots, drones, and sensor-driven systems that learn from physical interaction.'
      let i = 0
      const iv = setInterval(() => {
        appendTo(targetId, canned.slice(i, i + 3))
        i += 3
        if (i >= canned.length) {
          clearInterval(iv)
          finish()
        }
      }, 24)
    }
  }

  return {
    nodes: initialNodes,
    edges: initialEdges,
    selectedId: null,
    streamingId: null,
    composerSeed: '',
    paletteOpen: false,
    focusId: null,
    focusNonce: 0,
    fitAllNonce: 0,

    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) as AppNode[] })
      scheduleSave()
    },
    onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
    onConnect: (c) => set({ edges: addEdge(c, get().edges) }),
    setSelected: (id) => set({ selectedId: id }),
    setComposerSeed: (text) => set({ composerSeed: text }),
    setPaletteOpen: (open) => set({ paletteOpen: open }),

    sendPrompt: (text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const { selectedId, nodes, edges } = get()
      const parent =
        (selectedId && nodes.find((n) => n.id === selectedId && n.type === 'message')) ||
        [...nodes].reverse().find((n) => n.type === 'message') ||
        null
      const base = parent ? parent.position : { x: 0, y: 0 }

      const userId = uid()
      const asstId = uid()
      const userNode: MessageNodeType = {
        id: userId,
        type: 'message',
        position: { x: base.x + 60, y: base.y + 200 },
        data: { role: 'user', content: trimmed }
      }
      const asstNode: MessageNodeType = {
        id: asstId,
        type: 'message',
        position: { x: base.x + 60, y: base.y + 380 },
        data: { role: 'assistant', content: '' }
      }
      const newEdges: Edge[] = []
      if (parent) newEdges.push({ id: uid(), source: parent.id, target: userId })
      newEdges.push({ id: uid(), source: userId, target: asstId })

      set({
        nodes: [...nodes, userNode, asstNode],
        edges: [...edges, ...newEdges],
        streamingId: asstId,
        selectedId: asstId,
        composerSeed: ''
      })
      requestFocus(asstId)
      stream(asstId, trimmed)
    },

    branchFromSelection: (nodeId, quote) => {
      set({ selectedId: nodeId, composerSeed: `Regarding "${quote.trim()}": ` })
    },

    addSticky: () => {
      const a = anchor()
      const id = uid()
      const node: AppNode = {
        id,
        type: 'sticky',
        position: { x: a.x + 340, y: a.y },
        data: { text: '' }
      }
      set({ nodes: [...get().nodes, node], selectedId: id })
      requestFocus(id)
      scheduleSave()
    },

    addFrame: () => {
      const a = anchor()
      const id = uid()
      const node: AppNode = {
        id,
        type: 'frame',
        position: { x: a.x - 60, y: a.y - 80 },
        width: 520,
        height: 420,
        zIndex: -1,
        data: { title: 'Frame' }
      }
      set({ nodes: [...get().nodes, node], selectedId: id })
      requestFocus(id)
      scheduleSave()
    },

    updateSticky: (id, text) => {
      set({
        nodes: get().nodes.map((n) =>
          n.id === id && n.type === 'sticky' ? { ...n, data: { ...n.data, text } } : n
        )
      })
      scheduleSave()
    },

    newThread: () => set({ selectedId: null, composerSeed: '' }),

    requestFitAll: () => set({ fitAllNonce: get().fitAllNonce + 1 }),

    exportMarkdown: () => {
      const { nodes, edges } = get()
      const msgs = nodes.filter((n): n is MessageNodeType => n.type === 'message')
      const byId = new Map(msgs.map((n) => [n.id, n]))
      const childrenOf = new Map<string, string[]>()
      const hasIncoming = new Set<string>()
      for (const e of edges) {
        if (byId.has(e.source) && byId.has(e.target)) {
          childrenOf.set(e.source, [...(childrenOf.get(e.source) ?? []), e.target])
          hasIncoming.add(e.target)
        }
      }
      const roots = msgs.filter((n) => !hasIncoming.has(n.id))
      const lines: string[] = ['# lmcanvas-studio conversation', '']
      const walk = (id: string, depth: number): void => {
        const n = byId.get(id)
        if (!n) return
        const indent = '  '.repeat(depth)
        lines.push(`${indent}- **${n.data.role}:** ${n.data.content.replace(/\n/g, ' ')}`)
        for (const c of childrenOf.get(id) ?? []) walk(c, depth + 1)
      }
      for (const r of roots) walk(r.id, 0)

      const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'lmcanvas-conversation.md'
      a.click()
      URL.revokeObjectURL(url)
    },

    persist: () => {
      const { nodes, edges } = get()
      void window.api?.storage?.save(CANVAS_ID, { nodes, edges })
    },

    hydrate: async () => {
      const saved = (await window.api?.storage?.load(CANVAS_ID)) as
        | { nodes: AppNode[]; edges: Edge[] }
        | null
        | undefined
      if (saved && Array.isArray(saved.nodes) && saved.nodes.length > 0) {
        set({ nodes: saved.nodes, edges: saved.edges ?? [] })
      }
    }
  }
})
