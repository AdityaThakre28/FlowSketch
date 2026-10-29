import type { Edge, Node, Viewport } from '@xyflow/react'

export const COMPONENT_KINDS = [
  'startEnd',
  'process',
  'decision',
  'io',
  'userClient',
  'apiService',
  'database',
  'externalService',
] as const

export type ComponentKind = (typeof COMPONENT_KINDS)[number]

export type PaletteCategory = 'workflow' | 'architecture'

export type FlowNodeData = {
  title: string
  description: string
  notes: string
  kind: ComponentKind
}

export type FlowNode = Node<FlowNodeData, ComponentKind>

export type FlowEdgeData = {
  label?: string
}

export type FlowEdge = Edge<FlowEdgeData>

export type DiagramDocument = {
  id: string
  title: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  viewport: Viewport
  updatedAt: string
}

export const STORAGE_VERSION = 1 as const

export type PersistedState = {
  version: typeof STORAGE_VERSION
  diagrams: DiagramDocument[]
  currentDiagramId: string
}

export type ExportPayload = {
  version: typeof STORAGE_VERSION
  exportedAt: string
  diagram: DiagramDocument
}

export type SaveStatus = 'saved' | 'saving' | 'error'
