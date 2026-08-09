import type { extractVisualizeWidgetPayload } from 'streamviz/core'

export type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>

export type ToolCallRecord = {
  id: string
  name: string
  status: 'pending' | 'running' | 'complete' | 'error'
  target: string
  args?: unknown
  result?: unknown
  error?: string
  startedAt: number
  completedAt?: number
}

export type ConversationMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  toolCalls?: ToolCallRecord[]
  widget?: WidgetPayload | null
  error?: string
  isStreaming?: boolean
  startedAt?: number
  completedAt?: number
}
