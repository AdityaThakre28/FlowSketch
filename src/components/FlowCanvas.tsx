import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type OnMoveEnd,
} from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import { useCallback } from 'react'
import { isComponentKind } from '../lib/storage'
import { nodeTypes } from '../nodes'
import { PALETTE_DND_MIME, useEditorStore } from '../store/editorStore'
import type { ComponentKind } from '../types/diagram'

type FlowCanvasProps = {
  onReady: (api: { addAtCenter: (kind: ComponentKind) => void }) => void
}

export function FlowCanvas({ onReady }: FlowCanvasProps) {
  const diagrams = useEditorStore((state) => state.diagrams)
  const currentDiagramId = useEditorStore((state) => state.currentDiagramId)
  const onNodesChange = useEditorStore((state) => state.onNodesChange)
  const onEdgesChange = useEditorStore((state) => state.onEdgesChange)
  const onConnect = useEditorStore((state) => state.onConnect)
  const setViewport = useEditorStore((state) => state.setViewport)
  const addNode = useEditorStore((state) => state.addNode)
  const beginHistory = useEditorStore((state) => state.beginHistory)

  const current = diagrams.find((diagram) => diagram.id === currentDiagramId) ?? diagrams[0]
  const { screenToFlowPosition } = useReactFlow()

  const handleMoveEnd: OnMoveEnd = useCallback(
    (_event, viewport) => {
      setViewport(viewport)
    },
    [setViewport],
  )

  return (
    <div className="relative min-w-0 flex-1 bg-zinc-100">
      <ReactFlow
        key={current.id}
        nodes={current.nodes}
        edges={current.edges}
        nodeTypes={nodeTypes}
        defaultViewport={current.viewport}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={handleMoveEnd}
        onNodeDragStart={() => beginHistory()}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(event) => {
          event.preventDefault()
          const kind = event.dataTransfer.getData(PALETTE_DND_MIME)
          if (!isComponentKind(kind)) return
          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
          addNode(kind, position)
        }}
        onInit={(instance) => {
          onReady({
            addAtCenter: (kind) => {
              const pane = document.querySelector('.react-flow')
              if (!(pane instanceof HTMLElement)) {
                addNode(kind, { x: 120, y: 120 })
                return
              }
              const bounds = pane.getBoundingClientRect()
              const position = instance.screenToFlowPosition({
                x: bounds.left + bounds.width / 2,
                y: bounds.top + bounds.height / 2,
              })
              addNode(kind, { x: position.x - 90, y: position.y - 24 })
            },
          })
        }}
        fitView={current.nodes.length > 0 && current.viewport.zoom === 1 && current.viewport.x === 0}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#52525b', strokeWidth: 1.5 },
        }}
        connectionLineStyle={{ stroke: '#4f46e5', strokeWidth: 1.5 }}
        className="h-full w-full"
      >
        <Background id="dots" gap={18} size={1.2} color="#d4d4d8" variant={BackgroundVariant.Dots} />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          className="overflow-hidden rounded-md border border-zinc-200 shadow-sm"
          maskColor="rgba(24,24,27,0.08)"
          bgColor="#fafafa"
          nodeStrokeWidth={2}
          nodeColor="#e4e4e7"
        />
      </ReactFlow>
      {current.nodes.length === 0 ? (
        <div
          data-export-hide="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="max-w-sm rounded-md border border-zinc-200 bg-white/95 px-4 py-3 text-center shadow-sm">
            <GitBranch className="mx-auto mb-2 text-indigo-600" size={20} aria-hidden />
            <p className="text-sm font-medium text-zinc-800">Start a diagram</p>
            <p className="mt-1 text-[13px] leading-5 text-zinc-500">
              Drag a component from the left, or click one to place it on the canvas.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
