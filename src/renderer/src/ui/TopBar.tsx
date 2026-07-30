import { Menu, ChevronDown, Play } from 'lucide-react'

// Full-width top bar: menu + file breadcrumb on the left,
// collaborators / present / zoom / share on the right.
export default function TopBar(): JSX.Element {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="tb-menu" title="Main menu">
          <Menu size={16} />
        </button>
        <div className="tb-file">
          <span className="tb-crumb">Drafts</span>
          <span className="tb-slash">/</span>
          <span className="tb-title">lmcanvas-studio</span>
          <ChevronDown size={13} className="tb-caret" />
        </div>
      </div>

      <div className="topbar-right">
        <div className="tb-avatars">
          <span className="avatar" style={{ background: '#0d99ff' }}>R</span>
          <span className="avatar" style={{ background: '#a259ff' }}>C</span>
        </div>
        <button className="tb-play" title="Present">
          <Play size={13} fill="currentColor" />
        </button>
        <button className="tb-zoom">
          100% <ChevronDown size={12} />
        </button>
        <button className="tb-share">Share</button>
      </div>
    </header>
  )
}
