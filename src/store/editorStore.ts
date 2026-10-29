import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type Viewport,
} from '@xyflow/react'
import { create } from 'zustand'
import { createId } from '../lib/ids'
import { defaultTitle, loadPersistedState } from '../lib/storage'
import type {
  ComponentKind,
  DiagramDocument,
  FlowEdge,
  FlowNode,
  FlowNodeData,
  SaveStatus,
} from '../types/diagram'

type HistorySnapshot = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  title: string
}

type ToastMessage = {
  id: string
  tone: 'info' | 'error'
  text: string
}

type EditorState = {
  diagrams: DiagramDocument[]
  currentDiagramId: string
  saveStatus: SaveStatus
  past: HistorySnapshot[]
  future: HistorySnapshot[]
  toast: ToastMessage | null
  getCurrent: () => DiagramDocument
  nodes: () => FlowNode[]
  edges: () => FlowEdge[]
  canUndo: () => boolean
  canRedo: () => boolean
  setSaveStatus: (status: SaveStatus) => void
  showToast: (tone: ToastMessage['tone'], text: string) => void
  clearToast: () => void
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  onConnect: (connection: Connection) => void
  setViewport: (viewport: Viewport) => void
  addNode: (kind: ComponentKind, position: { x: number; y: number }) => void
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void
  changeNodeKind: (id: string, kind: ComponentKind) => void
  updateEdgeLabel: (id: string, label: string) => void
  setTitle: (title: string) => void
  beginHistory: () => void
  undo: () => void
  redo: () => void
  newDiagram: () => void
  deleteCurrentDiagram: () => void
  switchDiagram: (id: string) => void
  importDiagram: (diagram: DiagramDocument, mode: 'replace' | 'new') => void
}

const MAX_HISTORY = 50
const persisted = loadPersistedState()

function cloneSnapshot(nodes: FlowNode[], edges: FlowEdge[], title: string): HistorySnapshot {
  return {
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
    title,
  }
}

function snapshotsEqual(a: HistorySnapshot, b: HistorySnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function updateCurrent(
  diagrams: DiagramDocument[],
  currentDiagramId: string,
  patch: Partial<DiagramDocument>,
): DiagramDocument[] {
  return diagrams.map((diagram) =>
    diagram.id === currentDiagramId
      ? { ...diagram, ...patch, updatedAt: new Date().toISOString() }
      : diagram,
  )
}

export const useEditorStore = create<EditorState>((set, get) => ({
  diagrams: persisted.diagrams,
  currentDiagramId: persisted.currentDiagramId,
  saveStatus: 'saved',
  past: [],
  future: [],
  toast: null,

  getCurrent: () => {
    const { diagrams, currentDiagramId } = get()
    return diagrams.find((diagram) => diagram.id === currentDiagramId) ?? diagrams[0]
  },
  nodes: () => get().getCurrent().nodes,
  edges: () => get().getCurrent().edges,
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  showToast: (tone, text) =>
    set({
      toast: { id: createId('toast'), tone, text },
    }),
  clearToast: () => set({ toast: null }),

  beginHistory: () => {
    const current = get().getCurrent()
    const snapshot = cloneSnapshot(current.nodes, current.edges, current.title)
    const last = get().past[get().past.length - 1]
    if (last && snapshotsEqual(last, snapshot)) return
    set((state) => ({
      past: [...state.past, snapshot].slice(-MAX_HISTORY),
      future: [],
    }))
  },

  onNodesChange: (changes) => {
    const removes = changes.some((change) => change.type === 'remove')
    if (removes) get().beginHistory()
    const current = get().getCurrent()
    const nodes = applyNodeChanges(changes, current.nodes)
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { nodes }),
    })
  },

  onEdgesChange: (changes) => {
    const removes = changes.some((change) => change.type === 'remove')
    if (removes) get().beginHistory()
    const current = get().getCurrent()
    const edges = applyEdgeChanges(changes, current.edges)
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { edges }),
    })
  },

  onConnect: (connection) => {
    get().beginHistory()
    const current = get().getCurrent()
    const edges = addEdge(
      {
        ...connection,
        id: createId('edge'),
        data: { label: '' },
      },
      current.edges,
    )
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { edges }),
    })
  },

  setViewport: (viewport) => {
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { viewport }),
    })
  },

  addNode: (kind, position) => {
    get().beginHistory()
    const current = get().getCurrent()
    const node: FlowNode = {
      id: createId('node'),
      type: kind,
      position,
      data: {
        title: defaultTitle(kind),
        description: '',
        notes: '',
        kind,
      },
    }
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, {
        nodes: [...current.nodes, node],
      }),
    })
  },

  updateNodeData: (id, patch) => {
    const current = get().getCurrent()
    const nodes = current.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
    )
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { nodes }),
    })
  },

  changeNodeKind: (id, kind) => {
    get().beginHistory()
    const current = get().getCurrent()
    const nodes = current.nodes.map((node) =>
      node.id === id
        ? {
            ...node,
            type: kind,
            data: {
              ...node.data,
              kind,
              title: node.data.title.trim() ? node.data.title : defaultTitle(kind),
            },
          }
        : node,
    )
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { nodes }),
    })
  },

  updateEdgeLabel: (id, label) => {
    const current = get().getCurrent()
    const edges = current.edges.map((edge) =>
      edge.id === id ? { ...edge, label, data: { ...edge.data, label } } : edge,
    )
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { edges }),
    })
  },

  setTitle: (title) => {
    set({
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, { title }),
    })
  },

  undo: () => {
    const { past, getCurrent, future } = get()
    if (past.length === 0) return
    const current = getCurrent()
    const previous = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      future: [cloneSnapshot(current.nodes, current.edges, current.title), ...future],
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, {
        nodes: structuredClone(previous.nodes),
        edges: structuredClone(previous.edges),
        title: previous.title,
      }),
    })
  },

  redo: () => {
    const { future, getCurrent, past } = get()
    if (future.length === 0) return
    const current = getCurrent()
    const next = future[0]
    set({
      future: future.slice(1),
      past: [...past, cloneSnapshot(current.nodes, current.edges, current.title)],
      diagrams: updateCurrent(get().diagrams, get().currentDiagramId, {
        nodes: structuredClone(next.nodes),
        edges: structuredClone(next.edges),
        title: next.title,
      }),
    })
  },

  newDiagram: () => {
    const diagram = {
      id: createId('diagram'),
      title: 'Untitled diagram',
      nodes: [] as FlowNode[],
      edges: [] as FlowEdge[],
      viewport: { x: 0, y: 0, zoom: 1 },
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      diagrams: [...state.diagrams, diagram],
      currentDiagramId: diagram.id,
      past: [],
      future: [],
    }))
  },

  deleteCurrentDiagram: () => {
    const { diagrams, currentDiagramId } = get()
    const remaining = diagrams.filter((diagram) => diagram.id !== currentDiagramId)
    if (remaining.length === 0) {
      const diagram = {
        id: createId('diagram'),
        title: 'Untitled diagram',
        nodes: [] as FlowNode[],
        edges: [] as FlowEdge[],
        viewport: { x: 0, y: 0, zoom: 1 },
        updatedAt: new Date().toISOString(),
      }
      set({ diagrams: [diagram], currentDiagramId: diagram.id, past: [], future: [] })
      return
    }
    set({
      diagrams: remaining,
      currentDiagramId: remaining[0].id,
      past: [],
      future: [],
    })
  },

  switchDiagram: (id) => {
    if (id === get().currentDiagramId) return
    if (!get().diagrams.some((diagram) => diagram.id === id)) return
    set({ currentDiagramId: id, past: [], future: [] })
  },

  importDiagram: (diagram, mode) => {
    const imported: DiagramDocument = {
      ...diagram,
      id: createId('diagram'),
      updatedAt: new Date().toISOString(),
      nodes: diagram.nodes.map((node) => ({ ...node, selected: false, dragging: false })),
      edges: diagram.edges.map((edge) => ({ ...edge, selected: false })),
    }
    if (mode === 'replace') {
      set((state) => ({
        diagrams: state.diagrams.map((item) => (item.id === state.currentDiagramId ? imported : item)),
        currentDiagramId: imported.id,
        past: [],
        future: [],
      }))
      return
    }
    set((state) => ({
      diagrams: [...state.diagrams, imported],
      currentDiagramId: imported.id,
      past: [],
      future: [],
    }))
  },
}))

export const PALETTE_DND_MIME = 'application/x-flowsketch-kind'
