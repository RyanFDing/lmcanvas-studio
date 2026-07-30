import Canvas from './canvas/Canvas'

function App(): JSX.Element {
  return (
    <div className="app">
      <div className="topbar">
        <span className="wordmark">lmcanvas-studio</span>
        <span className="stage-badge">M1 · canvas</span>
      </div>
      <Canvas />
    </div>
  )
}

export default App
