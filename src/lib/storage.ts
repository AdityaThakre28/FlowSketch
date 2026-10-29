import {
  COMPONENT_KINDS,
  STORAGE_VERSION,
  type ComponentKind,
  type DiagramDocument,
  type ExportPayload,
  type FlowEdge,
  type FlowNode,
  type FlowNodeData,
  type PersistedState,
} from '../types/diagram'
import { createId } from './ids'

export const STORAGE_KEY = 'flowsketch.v1'

export function isComponentKind(value: unknown): value is ComponentKind {
  return typeof value === 'string' && (COMPONENT_KINDS as readonly string[]).includes(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseNodeData(value: unknown, kind: ComponentKind): FlowNodeData {
  if (!isRecord(value)) {
    return { title: defaultTitle(kind), description: '', notes: '', kind }
  }
  return {
    title: typeof value.title === 'string' ? value.title : defaultTitle(kind),
    description: typeof value.description === 'string' ? value.description : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
    kind: isComponentKind(value.kind) ? value.kind : kind,
  }
}

function parseNode(value: unknown): FlowNode | null {
  if (!isRecord(value) || typeof value.id !== 'string') return null
  const type = isComponentKind(value.type) ? value.type : undefined
  const dataKind = isRecord(value.data) && isComponentKind(value.data.kind) ? value.data.kind : undefined
  const kind = type ?? dataKind
  if (!kind) return null
  if (!isRecord(value.position) || typeof value.position.x !== 'number' || typeof value.position.y !== 'number') {
    return null
  }
  return {
    id: value.id,
    type: kind,
    position: { x: value.position.x, y: value.position.y },
    data: parseNodeData(value.data, kind),
    selected: value.selected === true,
    dragging: false,
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  }
}

function parseEdge(value: unknown): FlowEdge | null {
  if (!isRecord(value) || typeof value.id !== 'string') return null
  if (typeof value.source !== 'string' || typeof value.target !== 'string') return null
  const labelFromData =
    isRecord(value.data) && typeof value.data.label === 'string' ? value.data.label : undefined
  const label = typeof value.label === 'string' ? value.label : labelFromData
  return {
    id: value.id,
    source: value.source,
    target: value.target,
    sourceHandle: typeof value.sourceHandle === 'string' ? value.sourceHandle : undefined,
    targetHandle: typeof value.targetHandle === 'string' ? value.targetHandle : undefined,
    label,
    data: { label },
    selected: value.selected === true,
  }
}

function parseViewport(value: unknown): DiagramDocument['viewport'] {
  if (
    isRecord(value) &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.zoom === 'number'
  ) {
    return { x: value.x, y: value.y, zoom: value.zoom }
  }
  return { x: 0, y: 0, zoom: 1 }
}

export function defaultTitle(kind: ComponentKind): string {
  switch (kind) {
    case 'startEnd':
      return 'Start / End'
    case 'process':
      return 'Process'
    case 'decision':
      return 'Decision'
    case 'io':
      return 'Input / Output'
    case 'userClient':
      return 'User / Client'
    case 'apiService':
      return 'API / Service'
    case 'database':
      return 'Database'
    case 'externalService':
      return 'External Service'
  }
}

export function createEmptyDiagram(title = 'Untitled diagram'): DiagramDocument {
  return {
    id: createId('diagram'),
    title,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    updatedAt: new Date().toISOString(),
  }
}

export function parseDiagram(value: unknown): DiagramDocument | null {
  if (!isRecord(value)) return null
  const nodesRaw = Array.isArray(value.nodes) ? value.nodes : null
  const edgesRaw = Array.isArray(value.edges) ? value.edges : null
  if (!nodesRaw || !edgesRaw) return null

  const nodes: FlowNode[] = []
  for (const item of nodesRaw) {
    const node = parseNode(item)
    if (!node) return null
    nodes.push(node)
  }

  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges: FlowEdge[] = []
  for (const item of edgesRaw) {
    const edge = parseEdge(item)
    if (!edge) return null
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return null
    edges.push(edge)
  }

  return {
    id: typeof value.id === 'string' ? value.id : createId('diagram'),
    title: typeof value.title === 'string' && value.title.trim() ? value.title : 'Untitled diagram',
    nodes,
    edges,
    viewport: parseViewport(value.viewport),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }
}

export function parsePersistedState(raw: string | null): PersistedState | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) return null
    if (!Array.isArray(parsed.diagrams) || parsed.diagrams.length === 0) return null
    const diagrams: DiagramDocument[] = []
    for (const item of parsed.diagrams) {
      const diagram = parseDiagram(item)
      if (!diagram) return null
      diagrams.push(diagram)
    }
    const currentDiagramId =
      typeof parsed.currentDiagramId === 'string' && diagrams.some((d) => d.id === parsed.currentDiagramId)
        ? parsed.currentDiagramId
        : diagrams[0].id
    return { version: STORAGE_VERSION, diagrams, currentDiagramId }
  } catch {
    return null
  }
}

export function loadPersistedState(): PersistedState {
  try {
    const loaded = parsePersistedState(localStorage.getItem(STORAGE_KEY))
    if (loaded) return loaded
  } catch {
    // private mode or blocked storage
  }
  const diagram = createEmptyDiagram()
  return {
    version: STORAGE_VERSION,
    diagrams: [diagram],
    currentDiagramId: diagram.id,
  }
}

export function savePersistedState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function parseExportPayload(value: unknown): ExportPayload {
  if (!isRecord(value)) {
    throw new Error('File is not a JSON object.')
  }

  const diagramSource = isRecord(value.diagram) ? value.diagram : value
  const diagram = parseDiagram(diagramSource)
  if (!diagram) {
    throw new Error(
      'This file is not a valid FlowSketch export. It must include nodes and edges with known component types.',
    )
  }

  return {
    version: STORAGE_VERSION,
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString(),
    diagram,
  }
}
