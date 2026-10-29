import { useCallback, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { ComponentSidebar } from './components/ComponentSidebar'
import { FlowCanvas } from './components/FlowCanvas'
import { Inspector } from './components/Inspector'
import { Persistence } from './components/Persistence'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import type { ComponentKind } from './types/diagram'

function Editor() {
  const addAtCenterRef = useRef<(kind: ComponentKind) => void>(() => undefined)
  const [canvasElement, setCanvasElement] = useState<HTMLElement | null>(null)

  const onReady = useCallback((api: { addAtCenter: (kind: ComponentKind) => void }) => {
    addAtCenterRef.current = api.addAtCenter
    setCanvasElement(document.querySelector('.react-flow'))
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-100 text-zinc-800">
      <Persistence />
      <TopBar canvasElement={canvasElement} />
      <div className="flex min-h-0 flex-1">
        <ComponentSidebar onAddAtCenter={(kind) => addAtCenterRef.current(kind)} />
        <FlowCanvas onReady={onReady} />
        <Inspector />
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  )
}
