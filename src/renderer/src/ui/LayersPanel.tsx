import { ChevronDown, Frame, MessageSquare, Eye } from 'lucide-react'
import { useCanvasStore } from '../store/canvasStore'

// Floating left panel: page selector + a live layer tree of the canvas nodes.
export default function LayersPanel(): JSX.Element {
  const nodes = useCanvasStore((s) => s.nodes)
  const selectedId = useCanvasStore((s) => s.selectedId)
  const setSelected = useCanvasStore((s) => s.setSelected)

  return (
    <aside className="panel panel-left">
      <div className="panel-page">
        <span>Page 1</span>
        <ChevronDown size={13} />
      </div>
      <div className="panel-divider" />
      <div className="layer-list">
        <div className="layer-row" style={{ paddingLeft: 10 }}>
          <Frame size={13} className="layer-ico" />
          <span className="layer-label">Conversation</span>
          <Eye size={12} className="layer-eye" />
        </div>
        {nodes.map((n) => {
          const label = `${n.data.role} · ${n.data.content || '…'}`
          return (
            <div
              key={n.id}
              className={`layer-row ${selectedId === n.id ? 'is-selected' : ''}`}
              style={{ paddingLeft: 26 }}
              onClick={() => setSelected(n.id)}
            >
              <MessageSquare size={13} className="layer-ico" />
              <span className="layer-label">{label}</span>
              <Eye size={12} className="layer-eye" />
            </div>
          )
        })}
      </div>
    </aside>
  )
}
