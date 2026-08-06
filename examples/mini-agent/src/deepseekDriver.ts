import OpenAI from 'openai'
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions/completions'
import type { EventSink, JsonObject, ModelDriver, ModelRequest, ModelResponse, ModelTool } from './types'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_call_id?: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
}

type ToolAccumulator = {
  id: string
  name: string
  arguments: string
}

const messageText = (content: unknown) => {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map((part) => {
    if (!part || typeof part !== 'object') return ''
    const value = part as JsonObject
    return typeof value.text === 'string' ? value.text : ''
  }).join('')
}

export function toDeepSeekMessages(instructions: string, input: JsonObject[]): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: 'system', content: instructions }]
  for (const item of input) {
    if (item.type === 'function_call') continue
    if (item.type === 'function_call_output') {
      messages.push({
        role: 'tool',
        tool_call_id: String(item.call_id || ''),
        content: String(item.output || ''),
      })
      continue
    }
    const role = item.role
    if (role === 'user') {
      messages.push({ role, content: messageText(item.content) })
    } else if (role === 'assistant') {
      messages.push({
        role,
        content: messageText(item.content) || null,
        tool_calls: Array.isArray(item.tool_calls) ? item.tool_calls as ChatMessage['tool_calls'] : undefined,
      })
    }
  }
  return messages
}

export function toDeepSeekTools(tools: ModelTool[]) {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}

export class DeepSeekChatDriver implements ModelDriver {
  private readonly client: OpenAI

  constructor(options: { apiKey: string; baseURL?: string }) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL || 'https://api.deepseek.com',
    })
  }

  async complete(request: ModelRequest, emit: EventSink): Promise<ModelResponse> {
    const thinkingEnabled = request.reasoningEffort !== 'none'
    const params = {
      model: request.model,
      messages: toDeepSeekMessages(request.instructions, request.input),
      tools: toDeepSeekTools(request.tools),
      tool_choice: 'auto',
      parallel_tool_calls: false,
      thinking: {
        type: thinkingEnabled ? 'enabled' : 'disabled',
        ...(thinkingEnabled ? {
          reasoning_effort: ['xhigh', 'max'].includes(request.reasoningEffort) ? 'max' : 'high',
        } : {}),
      },
      stream_options: { include_usage: true },
      stream: true,
    }
    const stream = await this.client.chat.completions.create(
      params as unknown as ChatCompletionCreateParamsStreaming,
      { signal: request.signal },
    )
    const calls = new Map<number, ToolAccumulator>()
    let responseId = ''
    let outputText = ''
    let usage: JsonObject | undefined

    for await (const rawChunk of stream) {
      const chunk = rawChunk as unknown as JsonObject
      responseId ||= String(chunk.id || '')
      if (chunk.usage && typeof chunk.usage === 'object') usage = chunk.usage as JsonObject
      const choices = Array.isArray(chunk.choices) ? chunk.choices : []
      for (const rawChoice of choices) {
        if (!rawChoice || typeof rawChoice !== 'object') continue
        const choice = rawChoice as JsonObject
        const delta = choice.delta && typeof choice.delta === 'object' ? choice.delta as JsonObject : {}
        if (typeof delta.content === 'string' && delta.content) {
          outputText += delta.content
          await emit({ type: 'model.text.delta', delta: delta.content })
        }
        const toolCallDeltas = Array.isArray(delta.tool_calls) ? delta.tool_calls : []
        for (const rawToolCall of toolCallDeltas) {
          if (!rawToolCall || typeof rawToolCall !== 'object') continue
          const toolCall = rawToolCall as JsonObject
          const index = Number(toolCall.index || 0)
          const functionDelta = toolCall.function && typeof toolCall.function === 'object'
            ? toolCall.function as JsonObject
            : {}
          const current = calls.get(index) || { id: '', name: '', arguments: '' }
          current.id ||= String(toolCall.id || '')
          current.name ||= String(functionDelta.name || '')
          const argumentsDelta = typeof functionDelta.arguments === 'string' ? functionDelta.arguments : ''
          current.arguments += argumentsDelta
          calls.set(index, current)
          if (argumentsDelta) {
            await emit({
              type: 'model.tool.delta',
              callId: current.id,
              name: current.name,
              delta: argumentsDelta,
            })
          }
        }
      }
    }

    if (!responseId) throw new Error('DeepSeek stream ended without a response ID')
    const toolCalls = Array.from(calls.entries()).sort(([left], [right]) => left - right).map(([, call]) => ({
      id: call.id,
      type: 'function' as const,
      function: { name: call.name, arguments: call.arguments },
    }))
    const output = [
      {
        type: 'chat_message',
        role: 'assistant',
        content: outputText,
        ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
      },
      ...toolCalls.map((call) => ({
        type: 'function_call',
        call_id: call.id,
        name: call.function.name,
        arguments: call.function.arguments,
      })),
    ]
    return { id: responseId, output, outputText, usage }
  }
}
