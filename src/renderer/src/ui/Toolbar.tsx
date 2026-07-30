import {
  MousePointer2,
  Frame,
  StickyNote,
  PenTool,
  Type,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'
import { useCanvasStore } from '../store/canvasStore'

// Floating bottom toolbar pill — the signature Figma UI3 element.
export default function Toolbar(): JSX.Element {
  const [active, setActive] = useState('move')
  const addFrame = useCanvasStore((s) => s.addFrame)
  const addSticky = useCanvasStore((s) => s.addSticky)
  const setPaletteOpen = useCanvasStore((s) => s.setPaletteOpen)

  const tools = [
    { id: 'move', icon: <MousePointer2 size={17} />, title: 'Move (V)', run: () => {} },
    { id: 'frame', icon: <Frame size={17} />, title: 'Frame (F)', run: addFrame },
    { id: 'sticky', icon: <StickyNote size={17} />, title: 'Sticky note (S)', run: addSticky },
    { id: 'pen', icon: <PenTool size={17} />, title: 'Pen (P)', run: () => {} },
    { id: 'text', icon: <Type size={17} />, title: 'Text (T)', run: () => {} },
    { id: 'comment', icon: <MessageCircle size={17} />, title: 'Comment (C)', run: () => {} }
  ]

  return (
    <div className="toolbar">
      {tools.map((t) => (
        <button
          key={t.id}
          className={`tool-btn ${active === t.id ? 'is-active' : ''}`}
          title={t.title}
          onClick={() => {
            setActive(t.id)
            t.run()
          }}
        >
          {t.icon}
        </button>
      ))}
      <div className="tool-sep" />
      <button className="tool-btn tool-ai" title="Actions (⌘K)" onClick={() => setPaletteOpen(true)}>
        <Sparkles size={17} />
      </button>
    </div>
  )
}
