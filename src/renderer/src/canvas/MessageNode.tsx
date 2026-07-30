import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

export type MessageData = {
  role: 'user' | 'assistant'
  content: string
}

export type MessageNodeType = Node<MessageData, 'message'>

// A single conversation message rendered as a draggable card on the canvas.
// Top handle = where a reply connects in; bottom handle = where branches leave.
export default function MessageNode({ data, selected }: NodeProps<MessageNodeType>): JSX.Element {
  return (
    <div className={`msg-node msg-${data.role} ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="msg-role">{data.role}</div>
      <div className="msg-content">{data.content}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
