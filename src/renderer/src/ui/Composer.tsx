import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useCanvasStore } from '../store/canvasStore'

// Floating prompt bar. Enter sends; Shift+Enter for a newline.
// Sends branch from the selected node, else starts a new thread.
export default function Composer(): JSX.Element {
  const sendPrompt = useCanvasStore((s) => s.sendPrompt)
  const seed = useCanvasStore((s) => s.composerSeed)
  const selectedId = useCanvasStore((s) => s.selectedId)
  const streaming = useCanvasStore((s) => s.streamingId !== null)
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  // When a branch-from-selection seeds the composer, adopt + focus it.
  useEffect(() => {
    if (seed) {
      setText(seed)
      ref.current?.focus()
    }
  }, [seed])

  const submit = (): void => {
    if (!text.trim() || streaming) return
    sendPrompt(text)
    setText('')
  }

  return (
    <div className="composer">
      <textarea
        ref={ref}
        className="composer-input"
        rows={1}
        placeholder={
          selectedId ? 'Branch a reply from the selected node…' : 'Ask anything — starts a new thread…'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      <button className="composer-send" onClick={submit} disabled={!text.trim() || streaming}>
        <ArrowUp size={16} />
      </button>
    </div>
  )
}
