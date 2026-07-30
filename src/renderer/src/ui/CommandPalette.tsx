import { useEffect, useMemo, useRef, useState } from 'react'
import { StickyNote, Frame, Download, Maximize, Plus, Undo2, Redo2, CornerDownLeft } from 'lucide-react'
import { useCanvasStore } from '../store/canvasStore'

type Action = { id: string; label: string; hint?: string; icon: JSX.Element; run: () => void }

// ⌘K command palette — the iconic Figma/Raycast-style quick action overlay.
export default function CommandPalette(): JSX.Element | null {
  const open = useCanvasStore((s) => s.paletteOpen)
  const setOpen = useCanvasStore((s) => s.setPaletteOpen)
  const addSticky = useCanvasStore((s) => s.addSticky)
  const addFrame = useCanvasStore((s) => s.addFrame)
  const exportMarkdown = useCanvasStore((s) => s.exportMarkdown)
  const requestFitAll = useCanvasStore((s) => s.requestFitAll)
  const newThread = useCanvasStore((s) => s.newThread)
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const actions: Action[] = useMemo(
    () => [
      { id: 'new', label: 'New thread', hint: 'Clear selection', icon: <Plus size={15} />, run: newThread },
      { id: 'sticky', label: 'Add sticky note', icon: <StickyNote size={15} />, run: addSticky },
      { id: 'frame', label: 'Add frame', icon: <Frame size={15} />, run: addFrame },
      {
        id: 'export',
        label: 'Export conversation to Markdown',
        icon: <Download size={15} />,
        run: exportMarkdown
      },
      { id: 'fit', label: 'Fit to screen', icon: <Maximize size={15} />, run: requestFitAll },
      { id: 'undo', label: 'Undo', hint: '⌘Z', icon: <Undo2 size={15} />, run: undo },
      { id: 'redo', label: 'Redo', hint: '⌘⇧Z', icon: <Redo2 size={15} />, run: redo }
    ],
    [addSticky, addFrame, exportMarkdown, requestFitAll, newThread, undo, redo]
  )

  const filtered = useMemo(
    () => actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase())),
    [actions, query]
  )

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!useCanvasStore.getState().paletteOpen)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  if (!open) return null

  const run = (a: Action): void => {
    a.run()
    setOpen(false)
  }

  return (
    <div className="palette-overlay" onMouseDown={() => setOpen(false)}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Type a command…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(i + 1, filtered.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter' && filtered[active]) {
              run(filtered[active])
            }
          }}
        />
        <div className="palette-list">
          {filtered.map((a, i) => (
            <button
              key={a.id}
              className={`palette-item ${i === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(a)}
            >
              <span className="palette-ico">{a.icon}</span>
              <span className="palette-label">{a.label}</span>
              {a.hint && <span className="palette-hint">{a.hint}</span>}
              {i === active && <CornerDownLeft size={13} className="palette-enter" />}
            </button>
          ))}
          {filtered.length === 0 && <div className="palette-empty">No matching commands</div>}
        </div>
      </div>
    </div>
  )
}
