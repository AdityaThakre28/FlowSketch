import { useMemo } from 'react'
import { PALETTE_ITEMS } from '../data/palette'
import { useEditorStore } from '../store/editorStore'
import { COMPONENT_KINDS, type ComponentKind, type FlowEdge, type FlowNode } from '../types/diagram'

const fieldClass =
  'mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

export function Inspector() {
  const diagrams = useEditorStore((state) => state.diagrams)
  const currentDiagramId = useEditorStore((state) => state.currentDiagramId)
  const updateNodeData = useEditorStore((state) => state.updateNodeData)
  const changeNodeKind = useEditorStore((state) => state.changeNodeKind)
  const updateEdgeLabel = useEditorStore((state) => state.updateEdgeLabel)
  const beginHistory = useEditorStore((state) => state.beginHistory)

  const current = diagrams.find((diagram) => diagram.id === currentDiagramId) ?? diagrams[0]
  const selectedNodes = useMemo(
    () => current.nodes.filter((node) => node.selected),
    [current.nodes],
  )
  const selectedEdges = useMemo(
    () => current.edges.filter((edge) => edge.selected),
    [current.edges],
  )

  const node = selectedNodes.length === 1 ? selectedNodes[0] : null
  const edge = !node && selectedEdges.length === 1 ? selectedEdges[0] : null

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Properties</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {node ? (
          <NodeInspector
            node={node}
            onBeginHistory={beginHistory}
            onChangeData={updateNodeData}
            onChangeKind={changeNodeKind}
          />
        ) : edge ? (
          <EdgeInspector edge={edge} onBeginHistory={beginHistory} onChangeLabel={updateEdgeLabel} />
        ) : selectedNodes.length > 1 || selectedEdges.length > 1 ? (
          <EmptyState
            title="Multiple items selected"
            body="Select a single node or connection to edit its properties."
          />
        ) : (
          <EmptyState
            title="Nothing selected"
            body="Select a component or connection on the canvas to edit its title, type, and notes."
          />
        )}
      </div>
    </aside>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-3 py-4">
      <p className="text-sm font-medium text-zinc-800">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-zinc-500">{body}</p>
    </div>
  )
}

function NodeInspector({
  node,
  onBeginHistory,
  onChangeData,
  onChangeKind,
}: {
  node: FlowNode
  onBeginHistory: () => void
  onChangeData: (id: string, patch: { title?: string; description?: string; notes?: string }) => void
  onChangeKind: (id: string, kind: ComponentKind) => void
}) {
  return (
    <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
      <label className="block text-[12px] font-medium text-zinc-600">
        Title
        <input
          className={fieldClass}
          value={node.data.title}
          onFocus={onBeginHistory}
          onChange={(event) => onChangeData(node.id, { title: event.target.value })}
        />
      </label>
      <label className="block text-[12px] font-medium text-zinc-600">
        Description
        <textarea
          className={`${fieldClass} min-h-[72px] resize-y`}
          value={node.data.description}
          onFocus={onBeginHistory}
          onChange={(event) => onChangeData(node.id, { description: event.target.value })}
        />
      </label>
      <label className="block text-[12px] font-medium text-zinc-600">
        Component type
        <select
          className={fieldClass}
          value={node.data.kind}
          onFocus={onBeginHistory}
          onChange={(event) => onChangeKind(node.id, event.target.value as ComponentKind)}
        >
          {COMPONENT_KINDS.map((kind) => {
            const item = PALETTE_ITEMS.find((entry) => entry.kind === kind)
            return (
              <option key={kind} value={kind}>
                {item?.label ?? kind}
              </option>
            )
          })}
        </select>
      </label>
      <label className="block text-[12px] font-medium text-zinc-600">
        Notes
        <textarea
          className={`${fieldClass} min-h-[88px] resize-y`}
          value={node.data.notes}
          onFocus={onBeginHistory}
          onChange={(event) => onChangeData(node.id, { notes: event.target.value })}
          placeholder="Optional implementation notes"
        />
      </label>
    </form>
  )
}

function EdgeInspector({
  edge,
  onBeginHistory,
  onChangeLabel,
}: {
  edge: FlowEdge
  onBeginHistory: () => void
  onChangeLabel: (id: string, label: string) => void
}) {
  const label = typeof edge.label === 'string' ? edge.label : (edge.data?.label ?? '')
  return (
    <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
      <p className="text-sm text-zinc-600">Connection</p>
      <label className="block text-[12px] font-medium text-zinc-600">
        Label
        <input
          className={fieldClass}
          value={label}
          onFocus={onBeginHistory}
          onChange={(event) => onChangeLabel(edge.id, event.target.value)}
          placeholder="Optional, e.g. Yes / HTTP"
        />
      </label>
    </form>
  )
}
