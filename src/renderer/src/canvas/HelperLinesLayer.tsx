import { useCallback } from 'react'
import { useStore, type ReactFlowState } from '@xyflow/react'

const selector = (s: ReactFlowState): { width: number; height: number; transform: number[] } => ({
  width: s.width,
  height: s.height,
  transform: s.transform
})

export type HelperLinesProps = { horizontal?: number; vertical?: number }

// Canvas overlay that paints the pink/blue snapping guide lines in screen space.
export default function HelperLines({ horizontal, vertical }: HelperLinesProps): JSX.Element {
  const { width, height, transform } = useStore(selector)

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpi = window.devicePixelRatio || 1
      canvas.width = width * dpi
      canvas.height = height * dpi
      ctx.scale(dpi, dpi)
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#0d99ff'
      ctx.lineWidth = 1

      if (typeof vertical === 'number') {
        const x = vertical * transform[2] + transform[0]
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      if (typeof horizontal === 'number') {
        const y = horizontal * transform[2] + transform[1]
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    },
    [width, height, transform, horizontal, vertical]
  )

  return (
    <canvas
      ref={canvasRef}
      className="react-flow__helperlines"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}
    />
  )
}
