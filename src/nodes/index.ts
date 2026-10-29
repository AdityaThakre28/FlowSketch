import type { NodeTypes } from '@xyflow/react'
import {
  ApiServiceNode,
  DatabaseNode,
  DecisionNode,
  ExternalServiceNode,
  IoNode,
  ProcessNode,
  StartEndNode,
  UserClientNode,
} from './customNodes'

export const nodeTypes = {
  startEnd: StartEndNode,
  process: ProcessNode,
  decision: DecisionNode,
  io: IoNode,
  userClient: UserClientNode,
  apiService: ApiServiceNode,
  database: DatabaseNode,
  externalService: ExternalServiceNode,
} satisfies NodeTypes
