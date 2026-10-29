import { useEffect, useRef } from 'react'
import { savePersistedState } from '../lib/storage'
import { STORAGE_VERSION } from '../types/diagram'
import { useEditorStore } from '../store/editorStore'

export function Persistence() {
  const diagrams = useEditorStore((state) => state.diagrams)
  const currentDiagramId = useEditorStore((state) => state.currentDiagramId)
  const setSaveStatus = useEditorStore((state) => state.setSaveStatus)
  const showToast = useEditorStore((state) => state.showToast)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    setSaveStatus('saving')
    const timer = window.setTimeout(() => {
      try {
        savePersistedState({
          version: STORAGE_VERSION,
          diagrams,
          currentDiagramId,
        })
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
        showToast('error', 'Could not save to this browser. Local storage may be full or blocked.')
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [diagrams, currentDiagramId, setSaveStatus, showToast])

  return null
}
