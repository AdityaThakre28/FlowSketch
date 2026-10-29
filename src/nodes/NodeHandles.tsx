import { Handle, Position } from '@xyflow/react'

const handleClass =
  '!h-2.5 !w-2.5 !border !border-indigo-500 !bg-white !shadow-none'

export function NodeHandles() {
  return (
    <>
      <Handle id="top" type="target" position={Position.Top} className={handleClass} />
      <Handle id="right" type="source" position={Position.Right} className={handleClass} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={handleClass} />
      <Handle id="left" type="target" position={Position.Left} className={handleClass} />
    </>
  )
}
