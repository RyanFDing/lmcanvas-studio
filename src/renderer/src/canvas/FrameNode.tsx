import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { FrameNodeType } from './types'

// A resizable, labeled section — Figma's Frame. Sits behind message nodes
// (added with a negative zIndex) and can be dragged/resized as a group backdrop.
export default function FrameNode({ data, selected }: NodeProps<FrameNodeType>): JSX.Element {
  return (
    <div className="frame-node">
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={160}
        lineClassName="frame-resize-line"
        handleClassName="frame-resize-handle"
      />
      <div className="frame-title">{data.title}</div>
    </div>
  )
}
