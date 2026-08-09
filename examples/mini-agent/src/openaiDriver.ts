import OpenAI from 'openai'
import type { EventSink, JsonObject, ModelDriver, ModelOutputItem, ModelRequest, ModelResponse } from './types'

type OpenAIEvent = JsonObject & {
  type?: string
  delta?: string
  call_id?: string
  item_id?: string
  name?: string
  item?: JsonObject & {
    id?: string
    type?: string
    call_id?: string
    name?: string
  }
  response?: JsonObject & {
    id?: string
    output?: ModelOutputItem[]
    output_text?: string
    usage?: JsonObject
  }
}

export class OpenAIResponsesDriver implements ModelDriver {
  private readonly client: OpenAI

  constructor(options: { apiKey: string; baseURL?: string }) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL || undefined,
    })
  }

  async complete(request: ModelRequest, emit: EventSink): Promise<ModelResponse> {
    const stream = await this.client.responses.create({
      model: request.model,
      instructions: request.instructions,
      input: request.input as never,
      tools: request.tools as never,
      reasoning: { effort: request.reasoningEffort },
      parallel_tool_calls: false,
      store: false,
      stream: true,
    }, { signal: request.signal })

    let completed: OpenAIEvent['response']
    let outputText = ''
    const functionCalls = new Map<string, { callId: string; name: string }>()

    for await (const rawEvent of stream) {
      const event = rawEvent as unknown as OpenAIEvent
      if (event.type === 'response.output_item.added' && event.item?.type === 'function_call' && event.item.id) {
        functionCalls.set(event.item.id, {
          callId: String(event.item.call_id || event.item.id),
          name: String(event.item.name || ''),
        })
      } else if (event.type === 'response.output_text.delta' && event.delta) {
        outputText += event.delta
        await emit({ type: 'model.text.delta', delta: event.delta })
      } else if (event.type === 'response.function_call_arguments.delta' && event.delta) {
        const call = functionCalls.get(String(event.item_id || ''))
        await emit({
          type: 'model.tool.delta',
          callId: call?.callId || String(event.item_id || ''),
          name: call?.name || '',
          delta: event.delta,
        })
      } else if (event.type === 'response.completed') {
        completed = event.response
      } else if (event.type === 'response.failed') {
        throw new Error('OpenAI response failed; inspect the saved trace for the complete event stream')
      }
    }

    if (!completed?.id || !Array.isArray(completed.output)) {
      throw new Error('OpenAI stream ended without a completed response')
    }

    return {
      id: completed.id,
      output: completed.output,
      outputText: String(completed.output_text || outputText),
      usage: completed.usage,
    }
  }
}
