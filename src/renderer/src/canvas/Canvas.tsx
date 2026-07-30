import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type NodeTypes
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MessageNode, { type MessageNodeType } from './MessageNode'

const nodeTypes: NodeTypes = { message: MessageNode }

// Seed content so the canvas isn't empty. Real conversations arrive at M2.
const initialNodes: MessageNodeType[] = [
  {
    id: '1',
    type: 'message',
    position: { x: 0, y: 0 },
    data: { role: 'user', content: 'What is physical AI, in one line?' }
  },
  {
    id: '2',
    type: 'message',
    position: { x: 60, y: 240 },
    data: {
      role: 'assistant',
      content: 'AI that perceives and acts in the physical world through robots and sensors.'
    }
  }
]

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }]

export default function Canvas(): JSX.Element {
  const [nodes, , onNodesChange] = useNodesState<MessageNodeType>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  return (
    <div className="canvas-root">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        minZoom={0.2}
        maxZoom={2}
        selectionOnDrag
        panOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#2a2f3a" />
        <MiniMap pannable zoomable className="lm-minimap" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
