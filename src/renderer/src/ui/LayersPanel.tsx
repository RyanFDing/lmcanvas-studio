import { ChevronDown, Frame, MessageSquare, Eye } from 'lucide-react'

type Row = {
  id: string
  label: string
  kind: 'frame' | 'msg'
  depth: number
  selected?: boolean
}

const rows: Row[] = [
  { id: 'f', label: 'Conversation', kind: 'frame', depth: 0 },
  { id: '1', label: 'user · What is physical AI?', kind: 'msg', depth: 1 },
  { id: '2', label: 'assistant · AI that perceives…', kind: 'msg', depth: 1, selected: true },
  { id: '3', label: 'branch · give an example', kind: 'msg', depth: 1 }
]

// Floating left panel: page selector + the layer tree.
export default function LayersPanel(): JSX.Element {
  return (
    <aside className="panel panel-left">
      <div className="panel-page">
        <span>Page 1</span>
        <ChevronDown size={13} />
      </div>
      <div className="panel-divider" />
      <div className="layer-list">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`layer-row ${r.selected ? 'is-selected' : ''}`}
            style={{ paddingLeft: 10 + r.depth * 16 }}
          >
            {r.kind === 'frame' ? (
              <Frame size={13} className="layer-ico" />
            ) : (
              <MessageSquare size={13} className="layer-ico" />
            )}
            <span className="layer-label">{r.label}</span>
            <Eye size={12} className="layer-eye" />
          </div>
        ))}
      </div>
    </aside>
  )
}
