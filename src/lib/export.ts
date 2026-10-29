import { toPng } from 'html-to-image'
import type { DiagramDocument, ExportPayload } from '../types/diagram'
import { STORAGE_VERSION } from '../types/diagram'
import { parseExportPayload } from './storage'

export function buildExportPayload(diagram: DiagramDocument): ExportPayload {
  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    diagram: {
      ...diagram,
      nodes: diagram.nodes.map((node) => ({
        ...node,
        selected: false,
        dragging: false,
      })),
      edges: diagram.edges.map((edge) => ({
        ...edge,
        selected: false,
      })),
    },
  }
}

export function downloadJson(filename: string, payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readJsonFile(file: File): Promise<ExportPayload> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }
  return parseExportPayload(parsed)
}

export async function captureCanvasPng(element: HTMLElement): Promise<string> {
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#f4f4f5',
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true
      if (node.closest('[data-export-hide="true"]')) return false
      const ignored = ['react-flow__minimap', 'react-flow__controls', 'react-flow__panel']
      return !ignored.some((className) => node.classList.contains(className))
    },
  })
}

export function slugifyFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'diagram'
}
