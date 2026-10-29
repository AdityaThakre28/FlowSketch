import {
  CircleDot,
  Database,
  Diamond,
  Globe,
  LayoutList,
  Server,
  Square,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { ComponentKind, PaletteCategory } from '../types/diagram'

export type PaletteItem = {
  kind: ComponentKind
  category: PaletteCategory
  label: string
  description: string
  icon: LucideIcon
}

export const PALETTE_ITEMS: PaletteItem[] = [
  {
    kind: 'startEnd',
    category: 'workflow',
    label: 'Start / End',
    description: 'Entry or exit of a flow',
    icon: CircleDot,
  },
  {
    kind: 'process',
    category: 'workflow',
    label: 'Process',
    description: 'A step or operation',
    icon: Square,
  },
  {
    kind: 'decision',
    category: 'workflow',
    label: 'Decision',
    description: 'Branch on a condition',
    icon: Diamond,
  },
  {
    kind: 'io',
    category: 'workflow',
    label: 'Input / Output',
    description: 'Data entering or leaving',
    icon: LayoutList,
  },
  {
    kind: 'userClient',
    category: 'architecture',
    label: 'User / Client',
    description: 'Person or client app',
    icon: User,
  },
  {
    kind: 'apiService',
    category: 'architecture',
    label: 'API / Service',
    description: 'Backend or microservice',
    icon: Server,
  },
  {
    kind: 'database',
    category: 'architecture',
    label: 'Database',
    description: 'Persistent data store',
    icon: Database,
  },
  {
    kind: 'externalService',
    category: 'architecture',
    label: 'External Service',
    description: 'Third-party system',
    icon: Globe,
  },
]

export const PALETTE_SECTIONS: { id: PaletteCategory; title: string }[] = [
  { id: 'workflow', title: 'Workflow' },
  { id: 'architecture', title: 'System Architecture' },
]
