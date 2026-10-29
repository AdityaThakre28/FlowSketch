import { Check, ChevronDown, FolderOpen, GitBranch, LoaderCircle, Plus, Redo2, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { buildExportPayload, captureCanvasPng, downloadBlob, downloadJson, readJsonFile, slugifyFilename } from '../lib/export'
import { useEditorStore } from '../store/editorStore'
import { ConfirmDialog } from './ConfirmDialog'

type TopBarProps = {
  canvasElement: HTMLElement | null
}

export function TopBar({ canvasElement }: TopBarProps) {
  const diagrams = useEditorStore((state) => state.diagrams)
  const currentDiagramId = useEditorStore((state) => state.currentDiagramId)
  const saveStatus = useEditorStore((state) => state.saveStatus)
  const setTitle = useEditorStore((state) => state.setTitle)
  const beginHistory = useEditorStore((state) => state.beginHistory)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const past = useEditorStore((state) => state.past)
  const future = useEditorStore((state) => state.future)
  const newDiagram = useEditorStore((state) => state.newDiagram)
  const deleteCurrentDiagram = useEditorStore((state) => state.deleteCurrentDiagram)
  const switchDiagram = useEditorStore((state) => state.switchDiagram)
  const importDiagram = useEditorStore((state) => state.importDiagram)
  const showToast = useEditorStore((state) => state.showToast)

  const current = diagrams.find((diagram) => diagram.id === currentDiagramId) ?? diagrams[0]
  const [exportOpen, setExportOpen] = useState(false)
  const [confirm, setConfirm] = useState<null | 'new' | 'delete' | 'import'>(null)
  const pendingImport = useRef<Awaited<ReturnType<typeof readJsonFile>> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const exportId = useId()

  const hasContent = current.nodes.length > 0 || current.edges.length > 0

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setExportOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointer)
    return () => window.removeEventListener('mousedown', onPointer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === 'z' && event.shiftKey) {
        event.preventDefault()
        redo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault()
        undo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  const handleNew = () => {
    if (hasContent) {
      setConfirm('new')
      return
    }
    newDiagram()
  }

  const handleExportJson = () => {
    setExportOpen(false)
    downloadJson(`${slugifyFilename(current.title)}.flowsketch.json`, buildExportPayload(current))
  }

  const handleExportPng = async () => {
    setExportOpen(false)
    const target = canvasElement ?? document.querySelector('.react-flow')
    if (!(target instanceof HTMLElement)) {
      showToast('error', 'The canvas is not ready to export yet.')
      return
    }
    try {
      const dataUrl = await captureCanvasPng(target)
      const blob = await (await fetch(dataUrl)).blob()
      downloadBlob(blob, `${slugifyFilename(current.title)}.png`)
    } catch {
      showToast('error', 'PNG export failed. Try again after the diagram is fully visible.')
    }
  }

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const payload = await readJsonFile(file)
      pendingImport.current = payload
      if (hasContent) {
        setConfirm('import')
        return
      }
      importDiagram(payload.diagram, 'replace')
      showToast('info', 'Diagram imported.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not import this file.'
      showToast('error', message)
    }
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-3">
        <div className="flex items-center gap-2 text-zinc-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
            <GitBranch size={16} aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight">FlowSketch</span>
        </div>

        <label className="sr-only" htmlFor="diagram-title">
          Diagram title
        </label>
        <input
          id="diagram-title"
          value={current.title}
          onFocus={beginHistory}
          onChange={(event) => setTitle(event.target.value)}
          className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-zinc-800 outline-none hover:border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />

        <p className="hidden items-center gap-1 text-xs text-zinc-500 sm:flex" aria-live="polite">
          {saveStatus === 'saving' ? (
            <>
              <LoaderCircle size={12} className="animate-spin" aria-hidden />
              Saving
            </>
          ) : saveStatus === 'error' ? (
            'Save failed'
          ) : (
            <>
              <Check size={12} className="text-indigo-600" aria-hidden />
              Saved
            </>
          )}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            title="Undo"
            aria-label="Undo"
            className="rounded-md p-1.5 text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            title="Redo"
            aria-label="Redo"
            className="rounded-md p-1.5 text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <label className="sr-only" htmlFor="diagram-switcher">
          Open diagram
        </label>
        <select
          id="diagram-switcher"
          value={current.id}
          onChange={(event) => switchDiagram(event.target.value)}
          className="hidden h-8 max-w-[180px] rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 md:block"
        >
          {diagrams.map((diagram) => (
            <option key={diagram.id} value={diagram.id}>
              {diagram.title || 'Untitled diagram'}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleNew}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Plus size={14} aria-hidden />
          New
        </button>
        <button
          type="button"
          onClick={() => setConfirm('delete')}
          title="Delete diagram"
          aria-label="Delete diagram"
          className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={exportOpen}
            aria-controls={exportId}
            onClick={() => setExportOpen((open) => !open)}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-indigo-600 px-2.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Export
            <ChevronDown size={14} aria-hidden />
          </button>
          {exportOpen ? (
            <div
              id={exportId}
              role="menu"
              className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={handleExportJson}
              >
                Export JSON
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={() => void handleExportPng()}
              >
                Export PNG
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={() => {
                  setExportOpen(false)
                  fileRef.current?.click()
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <FolderOpen size={14} aria-hidden />
                  Import JSON
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Import JSON file"
        onChange={(event) => {
          const file = event.target.files?.[0]
          void handleImportFile(file)
          event.target.value = ''
        }}
      />

      <ConfirmDialog
        open={confirm === 'new'}
        title="Create a new diagram?"
        description="Your current diagram is saved in this browser. A new empty diagram will be opened alongside it."
        confirmLabel="Create diagram"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          newDiagram()
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete this diagram?"
        description="This removes the diagram from this browser. Export JSON first if you want a backup."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          deleteCurrentDiagram()
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'import'}
        title="Import as a new diagram?"
        description="The current canvas has content. The imported file will be added as a separate diagram so nothing is overwritten."
        confirmLabel="Import"
        onCancel={() => {
          pendingImport.current = null
          setConfirm(null)
        }}
        onConfirm={() => {
          const payload = pendingImport.current
          if (payload) {
            importDiagram(payload.diagram, 'new')
            showToast('info', 'Diagram imported.')
          }
          pendingImport.current = null
          setConfirm(null)
        }}
      />
    </>
  )
}
