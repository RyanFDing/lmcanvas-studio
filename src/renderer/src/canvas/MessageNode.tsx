import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import { useCanvasStore } from '../store/canvasStore'
import type { MessageNodeType } from './types'

export type { MessageData, MessageNodeType } from './types'

// A single conversation message rendered as a draggable card on the canvas.
export default function MessageNode({ id, data, selected }: NodeProps<MessageNodeType>): JSX.Element {
  const setSelected = useCanvasStore((s) => s.setSelected)
  const branchFromSelection = useCanvasStore((s) => s.branchFromSelection)
  const isStreaming = useCanvasStore((s) => s.streamingId === id)

  // Selecting text inside a node seeds a branch from that quote.
  const onMouseUp = (): void => {
    const sel = window.getSelection()?.toString() ?? ''
    if (sel.trim().length > 1) branchFromSelection(id, sel)
  }

  return (
    <div className={`msg-node msg-${data.role} ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="msg-head">
        <span className="msg-role">{data.role}</span>
        <button className="msg-branch" title="Branch from here" onClick={() => setSelected(id)}>
          <GitBranch size={12} />
        </button>
      </div>
      <div className="msg-content" onMouseUp={onMouseUp}>
        {data.content}
        {isStreaming && <span className="caret" />}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
