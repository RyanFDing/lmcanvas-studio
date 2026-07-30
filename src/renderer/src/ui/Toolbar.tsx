import {
  MousePointer2,
  Frame,
  Square,
  PenTool,
  Type,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

type Tool = { id: string; icon: JSX.Element; title: string }

const tools: Tool[] = [
  { id: 'move', icon: <MousePointer2 size={17} />, title: 'Move (V)' },
  { id: 'frame', icon: <Frame size={17} />, title: 'Frame (F)' },
  { id: 'shape', icon: <Square size={17} />, title: 'Rectangle (R)' },
  { id: 'pen', icon: <PenTool size={17} />, title: 'Pen (P)' },
  { id: 'text', icon: <Type size={17} />, title: 'Text (T)' },
  { id: 'comment', icon: <MessageCircle size={17} />, title: 'Comment (C)' }
]

// Floating bottom toolbar pill — the signature Figma UI3 element.
export default function Toolbar(): JSX.Element {
  const [active, setActive] = useState('move')
  return (
    <div className="toolbar">
      {tools.map((t) => (
        <button
          key={t.id}
          className={`tool-btn ${active === t.id ? 'is-active' : ''}`}
          title={t.title}
          onClick={() => setActive(t.id)}
        >
          {t.icon}
        </button>
      ))}
      <div className="tool-sep" />
      <button className="tool-btn tool-ai" title="Actions">
        <Sparkles size={17} />
      </button>
    </div>
  )
}
