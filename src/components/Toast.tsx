import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

export function Toast() {
  const toast = useEditorStore((state) => state.toast)
  const clearToast = useEditorStore((state) => state.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => clearToast(), 4200)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      role="status"
      className={[
        'fixed bottom-4 right-4 z-40 max-w-sm rounded-md border px-3 py-2 text-sm shadow-md',
        toast.tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-zinc-200 bg-white text-zinc-700',
      ].join(' ')}
    >
      {toast.text}
    </div>
  )
}
