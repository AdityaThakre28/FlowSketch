import { PALETTE_ITEMS, PALETTE_SECTIONS } from '../data/palette'
import { PALETTE_DND_MIME } from '../store/editorStore'
import type { ComponentKind } from '../types/diagram'

type ComponentSidebarProps = {
  onAddAtCenter: (kind: ComponentKind) => void
}

export function ComponentSidebar({ onAddAtCenter }: ComponentSidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
      <div className="border-b border-zinc-200 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Components</h2>
        <p className="mt-1 text-[11px] leading-4 text-zinc-500">Drag onto the canvas or click to add.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {PALETTE_SECTIONS.map((section) => (
          <section key={section.id} className="mb-3">
            <h3 className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {PALETTE_ITEMS.filter((item) => item.category === section.id).map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.kind}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(PALETTE_DND_MIME, item.kind)
                        event.dataTransfer.effectAllowed = 'move'
                      }}
                      onClick={() => onAddAtCenter(item.kind)}
                      className="flex w-full items-start gap-2 rounded-md border border-transparent bg-white px-2 py-1.5 text-left shadow-[0_1px_1px_rgba(15,23,42,0.04)] ring-1 ring-zinc-200 hover:border-indigo-200 hover:ring-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-indigo-600">
                        <Icon size={15} aria-hidden />
                      </span>
                      <span>
                        <span className="block text-[13px] font-medium text-zinc-800">{item.label}</span>
                        <span className="block text-[11px] leading-4 text-zinc-500">{item.description}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
