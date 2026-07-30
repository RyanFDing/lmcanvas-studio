import Canvas from './canvas/Canvas'
import TopBar from './ui/TopBar'
import LayersPanel from './ui/LayersPanel'
import Inspector from './ui/Inspector'
import Toolbar from './ui/Toolbar'
import Composer from './ui/Composer'

function App(): JSX.Element {
  return (
    <div className="app">
      <TopBar />
      <div className="workspace">
        <Canvas />
        <LayersPanel />
        <Inspector />
        <Composer />
        <Toolbar />
      </div>
    </div>
  )
}

export default App
