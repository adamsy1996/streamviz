export type JsonObject = Record<string, unknown>

export type ModelTool = {
  type: 'function'
  name: string
  description: string
  parameters: JsonObject
  strict: true
}

export type ModelRequest = {
  model: string
  instructions: string
  input: Array<JsonObject>
  tools: ModelTool[]
  reasoningEffort: 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  signal?: AbortSignal
}

export type ModelOutputItem = JsonObject & {
  type: string
  call_id?: string
  name?: string
  arguments?: string
}

export type ModelResponse = {
  id: string
  output: ModelOutputItem[]
  outputText: string
  usage?: JsonObject
}

export type DebugWidget = {
  kind: 'visualize_widget'
  title: string
  widget_code: string
  loading_messages: readonly string[]
  mode: 'iframe'
}

export type AgentEvent =
  | { type: 'run.started'; runId: string; provider: string; model: string; prompt: string }
  | { type: 'turn.started'; turn: number }
  | { type: 'model.text.delta'; delta: string }
  | { type: 'model.tool.delta'; callId: string; name: string; delta: string }
  | { type: 'model.response'; responseId: string; usage?: JsonObject }
  | { type: 'tool.started'; callId: string; name: string; arguments: JsonObject }
  | { type: 'tool.completed'; callId: string; name: string; output: string }
  | { type: 'widget.completed'; callId: string; widget: DebugWidget }
  | { type: 'run.completed'; runId: string; turns: number; text: string; widgets: DebugWidget[] }
  | { type: 'run.failed'; runId: string; message: string }

export type EventSink = (event: AgentEvent) => void | Promise<void>

export interface ModelDriver {
  complete(request: ModelRequest, emit: EventSink): Promise<ModelResponse>
}

export type AgentRunResult = {
  runId: string
  turns: number
  text: string
  widgets: DebugWidget[]
}
