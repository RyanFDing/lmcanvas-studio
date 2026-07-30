import {
  Plus,
  Contrast,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal
} from 'lucide-react'
import { useCanvasStore, type AlignMode } from '../store/canvasStore'

const alignButtons: { Icon: typeof AlignStartVertical; mode: AlignMode }[] = [
  { Icon: AlignStartVertical, mode: 'left' },
  { Icon: AlignCenterVertical, mode: 'hcenter' },
  { Icon: AlignEndVertical, mode: 'right' },
  { Icon: AlignStartHorizontal, mode: 'top' },
  { Icon: AlignCenterHorizontal, mode: 'vmiddle' },
  { Icon: AlignEndHorizontal, mode: 'bottom' }
]

// A small inline glyph for corner-radius (an L with a rounded corner).
function RadiusGlyph(): JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 21 L4 11 A7 7 0 0 1 11 4 L21 4" strokeLinecap="round" />
    </svg>
  )
}

// Floating right panel: the Design/Inspector, Figma-style property sections.
export default function Inspector(): JSX.Element {
  const alignSelected = useCanvasStore((s) => s.alignSelected)
  return (
    <aside className="panel panel-right">
      <div className="insp-tabs">
        <button className="insp-tab is-active">Design</button>
        <button className="insp-tab">Prototype</button>
      </div>
      <div className="panel-divider" />

      {/* Alignment row — acts on the current multi-selection */}
      <div className="insp-align">
        {alignButtons.map(({ Icon, mode }) => (
          <button
            key={mode}
            className="align-btn"
            aria-label={`align-${mode}`}
            title={`Align ${mode}`}
            onClick={() => alignSelected(mode)}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <div className="panel-divider" />

      {/* Position */}
      <Section title="Position">
        <div className="field-grid">
          <Field label="X" value="60" />
          <Field label="Y" value="240" />
          <Field label="W" value="260" />
          <Field label="H" value="96" />
        </div>
      </Section>
      <div className="panel-divider" />

      {/* Appearance — icon labels so nothing overflows */}
      <Section title="Appearance">
        <div className="field-grid">
          <IconField icon={<Contrast size={13} />} value="100%" />
          <IconField icon={<RadiusGlyph />} value="12" />
        </div>
      </Section>
      <div className="panel-divider" />

      {/* Fill */}
      <Section title="Fill" addable>
        <div className="fill-row">
          <span className="swatch" style={{ background: '#2c2c2c' }} />
          <span className="fill-hex">2C2C2C</span>
          <span className="fill-alpha">100%</span>
        </div>
      </Section>
      <div className="panel-divider" />

      {/* Stroke */}
      <Section title="Stroke" addable>
        <div className="fill-row">
          <span className="swatch" style={{ background: '#0d99ff' }} />
          <span className="fill-hex">0D99FF</span>
          <span className="fill-alpha">100%</span>
        </div>
      </Section>
    </aside>
  )
}

function Section({
  title,
  addable,
  children
}: {
  title: string
  addable?: boolean
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="insp-section">
      <div className="insp-section-head">
        <span>{title}</span>
        {addable && (
          <button className="insp-add" aria-label={`Add ${title}`}>
            <Plus size={13} />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="field-input" defaultValue={value} />
    </label>
  )
}

function IconField({ icon, value }: { icon: JSX.Element; value: string }): JSX.Element {
  return (
    <label className="field">
      <span className="field-ico">{icon}</span>
      <input className="field-input" defaultValue={value} />
    </label>
  )
}
