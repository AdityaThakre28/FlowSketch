import type { FlowNodeData } from '../types/diagram'

export function NodeContent({ data, align = 'left' }: { data: FlowNodeData; align?: 'left' | 'center' }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <div className="text-[13px] font-medium leading-tight text-zinc-800">{data.title}</div>
      {data.description ? (
        <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-zinc-500">{data.description}</p>
      ) : null}
    </div>
  )
}
