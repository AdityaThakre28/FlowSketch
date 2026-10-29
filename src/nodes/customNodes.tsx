import { type NodeProps } from '@xyflow/react'
import { Database, Globe, Server, User } from 'lucide-react'
import type { FlowNode } from '../types/diagram'
import { NodeContent } from './nodeContent'
import { NodeHandles } from './NodeHandles'

type Props = NodeProps<FlowNode>

function shell(selected: boolean, extra = '') {
  return [
    'relative bg-white text-zinc-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-shadow',
    selected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-zinc-200',
    extra,
  ].join(' ')
}

export function StartEndNode({ data, selected }: Props) {
  return (
    <div className={shell(selected, 'flex min-h-[64px] w-[200px] items-center rounded-full px-6 py-3')}>
      <NodeHandles />
      <NodeContent data={data} align="center" />
    </div>
  )
}

export function ProcessNode({ data, selected }: Props) {
  return (
    <div className={shell(selected, 'w-[220px] rounded-md px-3 py-2.5')}>
      <NodeHandles />
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-indigo-600">Process</div>
      <NodeContent data={data} />
    </div>
  )
}

export function DecisionNode({ data, selected }: Props) {
  return (
    <div className="relative flex h-[168px] w-[168px] items-center justify-center">
      <div
        className={[
          'absolute inset-[18px] rotate-45 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]',
          selected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-zinc-200',
        ].join(' ')}
      />
      <NodeHandles />
      <div className="relative z-10 w-[110px] px-1">
        <div className="mb-1 text-center text-[10px] font-medium uppercase tracking-wide text-indigo-600">
          Decision
        </div>
        <NodeContent data={data} align="center" />
      </div>
    </div>
  )
}

export function IoNode({ data, selected }: Props) {
  return (
    <div className="relative w-[230px]">
      <div
        className={[
          '-skew-x-12 bg-white px-5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]',
          selected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-zinc-200',
        ].join(' ')}
      >
        <div className="skew-x-12">
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-indigo-600">I / O</div>
          <NodeContent data={data} />
        </div>
      </div>
      <NodeHandles />
    </div>
  )
}

export function UserClientNode({ data, selected }: Props) {
  return (
    <div className={shell(selected, 'flex w-[220px] gap-2.5 rounded-md px-3 py-2.5')}>
      <NodeHandles />
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
        <User size={16} aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-indigo-600">User / Client</div>
        <NodeContent data={data} />
      </div>
    </div>
  )
}

export function ApiServiceNode({ data, selected }: Props) {
  return (
    <div className={shell(selected, 'flex w-[220px] gap-2.5 rounded-md px-3 py-2.5')}>
      <NodeHandles />
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-zinc-100 text-zinc-600">
        <Server size={16} aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-indigo-600">API / Service</div>
        <NodeContent data={data} />
      </div>
    </div>
  )
}

export function DatabaseNode({ data, selected }: Props) {
  return (
    <div className="relative w-[180px]">
      <div
        className={[
          'overflow-hidden bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]',
          selected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-zinc-200',
        ].join(' ')}
        style={{ borderRadius: '90px / 18px' }}
      >
        <div className="flex h-4 items-center justify-center border-b border-zinc-200 bg-zinc-50">
          <Database size={12} className="text-indigo-600" aria-hidden />
        </div>
        <div className="px-3 py-3">
          <NodeContent data={data} align="center" />
        </div>
      </div>
      <NodeHandles />
    </div>
  )
}

export function ExternalServiceNode({ data, selected }: Props) {
  return (
    <div
      className={[
        'relative flex w-[220px] gap-2.5 rounded-md border border-dashed bg-white px-3 py-2.5',
        selected ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-zinc-300',
      ].join(' ')}
    >
      <NodeHandles />
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-zinc-600">
        <Globe size={16} aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-indigo-600">External</div>
        <NodeContent data={data} />
      </div>
    </div>
  )
}
