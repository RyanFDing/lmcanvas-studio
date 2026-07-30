import { type NodeProps } from '@xyflow/react'
import { useCanvasStore } from '../store/canvasStore'
import type { StickyNodeType } from './types'

// A FigJam-style sticky note — freeform, editable annotation (not sent to AI).
export default function StickyNode({ id, data, selected }: NodeProps<StickyNodeType>): JSX.Element {
  const updateSticky = useCanvasStore((s) => s.updateSticky)
  return (
    <div className={`sticky-node ${selected ? 'is-selected' : ''}`}>
      <textarea
        className="sticky-text nodrag"
        defaultValue={data.text}
        placeholder="Note…"
        onChange={(e) => updateSticky(id, e.target.value)}
      />
    </div>
  )
}
