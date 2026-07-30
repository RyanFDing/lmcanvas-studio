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
import type { MessageNodeType } from '../canvas/MessageNode'

const CANVAS_ID = 'default'

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const initialNodes: MessageNodeType[] = [
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
  nodes: MessageNodeType[]
  edges: Edge[]
  selectedId: string | null
  streamingId: string | null
  composerSeed: string

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (c: Connection) => void
  setSelected: (id: string | null) => void
  setComposerSeed: (text: string) => void

  sendPrompt: (text: string) => void
  branchFromSelection: (nodeId: string, quote: string) => void

  persist: () => void
  hydrate: () => Promise<void>
}

export const useCanvasStore = create<CanvasState>((set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const scheduleSave = (): void => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => get().persist(), 500)
  }

  const appendTo = (id: string, delta: string): void =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, content: n.data.content + delta } } : n
      )
    })

  const stream = (targetId: string, prompt: string): void => {
    const requestId = uid()
    const finish = (): void => {
      set({ streamingId: null })
      scheduleSave()
    }

    if (window.api?.ai) {
      // Real path: live claude CLI via Electron IPC.
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
      // Browser-preview fallback: mock a streamed reply so the UI is demoable.
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

    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) as MessageNodeType[] })
      scheduleSave()
    },
    onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
    onConnect: (c) => set({ edges: addEdge(c, get().edges) }),
    setSelected: (id) => set({ selectedId: id }),
    setComposerSeed: (text) => set({ composerSeed: text }),

    sendPrompt: (text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const { selectedId, nodes, edges } = get()
      // Branch from the selected node, else from the most recent node.
      const parent =
        (selectedId && nodes.find((n) => n.id === selectedId)) || nodes[nodes.length - 1] || null
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
      stream(asstId, trimmed)
    },

    branchFromSelection: (nodeId, quote) => {
      // "Branch from highlighted text": select the source node and pre-fill
      // the composer with the quote as context for the next prompt.
      set({ selectedId: nodeId, composerSeed: `Regarding "${quote.trim()}": ` })
    },

    persist: () => {
      const { nodes, edges } = get()
      void window.api?.storage?.save(CANVAS_ID, { nodes, edges })
    },

    hydrate: async () => {
      const saved = (await window.api?.storage?.load(CANVAS_ID)) as
        | { nodes: MessageNodeType[]; edges: Edge[] }
        | null
        | undefined
      if (saved && Array.isArray(saved.nodes) && saved.nodes.length > 0) {
        set({ nodes: saved.nodes, edges: saved.edges ?? [] })
      }
    }
  }
})
