import { useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type OnSelectionChangeParams
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MessageNode from './MessageNode'
import StickyNode from './StickyNode'
import FrameNode from './FrameNode'
import { useCanvasStore } from '../store/canvasStore'

const nodeTypes: NodeTypes = { message: MessageNode, sticky: StickyNode, frame: FrameNode }

function Flow(): JSX.Element {
  const { fitView } = useReactFlow()
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnect = useCanvasStore((s) => s.onConnect)
  const setSelected = useCanvasStore((s) => s.setSelected)
  const focusId = useCanvasStore((s) => s.focusId)
  const focusNonce = useCanvasStore((s) => s.focusNonce)
  const fitAllNonce = useCanvasStore((s) => s.fitAllNonce)
  const hydrate = useCanvasStore((s) => s.hydrate)

  // Load any saved canvas from disk on first mount (M3 persistence).
  useEffect(() => {
    void hydrate()
  }, [hydrate])

  // Follow a newly-added / streaming node so it never lands off-screen.
  // Deferred so xyflow has registered + measured the freshly-added node.
  useEffect(() => {
    if (!focusId) return
    const t = setTimeout(() => {
      void fitView({ nodes: [{ id: focusId }], duration: 600, padding: 0.75, maxZoom: 1 })
    }, 120)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce])

  // "Fit to screen" command → frame everything.
  useEffect(() => {
    if (fitAllNonce === 0) return
    void fitView({ duration: 600, padding: 0.2 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitAllNonce])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={(p: OnSelectionChangeParams) => setSelected(p.nodes[0]?.id ?? null)}
      fitView
      fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
      minZoom={0.2}
      maxZoom={2}
      panOnScroll
      selectionOnDrag
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1.4} color="#333333" />
    </ReactFlow>
  )
}

export default function Canvas(): JSX.Element {
  return (
    <div className="canvas-root">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  )
}
