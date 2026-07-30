import { type NodePositionChange, type XYPosition } from '@xyflow/react'
import type { AppNode } from './types'

type GetHelperLinesResult = {
  horizontal?: number
  vertical?: number
  snapPosition: Partial<XYPosition>
}

const w = (n: AppNode): number => n.measured?.width ?? (n.width as number) ?? 0
const h = (n: AppNode): number => n.measured?.height ?? (n.height as number) ?? 0

// Figma-style object snapping: while dragging one node, find the nearest
// aligning edge/center of any other node and snap to it, returning the guide
// line positions to draw. Adapted from the xyflow helper-lines pattern.
export function getHelperLines(
  change: NodePositionChange,
  nodes: AppNode[],
  distance = 6
): GetHelperLinesResult {
  const result: GetHelperLinesResult = { snapPosition: { x: undefined, y: undefined } }
  const nodeA = nodes.find((n) => n.id === change.id)
  if (!nodeA || !change.position) return result

  const a = {
    left: change.position.x,
    right: change.position.x + w(nodeA),
    top: change.position.y,
    bottom: change.position.y + h(nodeA),
    width: w(nodeA),
    height: h(nodeA)
  }

  let vDist = distance
  let hDist = distance

  for (const nodeB of nodes) {
    if (nodeB.id === nodeA.id) continue
    const b = {
      left: nodeB.position.x,
      right: nodeB.position.x + w(nodeB),
      top: nodeB.position.y,
      bottom: nodeB.position.y + h(nodeB),
      centerX: nodeB.position.x + w(nodeB) / 2,
      centerY: nodeB.position.y + h(nodeB) / 2
    }

    // Vertical guides (align on X)
    const vChecks: [number, number, number][] = [
      [Math.abs(a.left - b.left), b.left, b.left],
      [Math.abs(a.right - b.right), b.right - a.width, b.right],
      [Math.abs(a.left - b.right), b.right, b.right],
      [Math.abs(a.right - b.left), b.left - a.width, b.left],
      [Math.abs(a.left + a.width / 2 - b.centerX), b.centerX - a.width / 2, b.centerX]
    ]
    for (const [d, snapX, line] of vChecks) {
      if (d < vDist) {
        result.snapPosition.x = snapX
        result.vertical = line
        vDist = d
      }
    }

    // Horizontal guides (align on Y)
    const hChecks: [number, number, number][] = [
      [Math.abs(a.top - b.top), b.top, b.top],
      [Math.abs(a.bottom - b.bottom), b.bottom - a.height, b.bottom],
      [Math.abs(a.top - b.bottom), b.bottom, b.bottom],
      [Math.abs(a.bottom - b.top), b.top - a.height, b.top],
      [Math.abs(a.top + a.height / 2 - b.centerY), b.centerY - a.height / 2, b.centerY]
    ]
    for (const [d, snapY, line] of hChecks) {
      if (d < hDist) {
        result.snapPosition.y = snapY
        result.horizontal = line
        hDist = d
      }
    }
  }

  return result
}
