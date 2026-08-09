import { randomUUID } from 'node:crypto'
import { buildMiniAgentPrompt } from './prompt'
import type {
  AgentRunResult,
  DebugWidget,
  EventSink,
  JsonObject,
  ModelDriver,
  ModelOutputItem,
} from './types'
import { executeVisualizeTool, visualizeTools } from './visualizeTools'

const parseArguments = (raw: string | undefined, toolName: string): JsonObject => {
  try {
    const parsed = JSON.parse(raw || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    return parsed as JsonObject
  } catch (error) {
    throw new Error(`Invalid JSON arguments from ${toolName}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const functionCalls = (output: ModelOutputItem[]) =>
  output.filter((item) => item.type === 'function_call' && item.call_id && item.name)

export async function runMiniAgent(options: {
  driver: ModelDriver
  prompt: string
  provider?: string
  model?: string
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  maxTurns?: number
  extraInstructions?: string
  signal?: AbortSignal
  emit?: EventSink
  runId?: string
}): Promise<AgentRunResult> {
  const runId = options.runId || randomUUID()
  const model = options.model || 'gpt-5.6-sol'
  const maxTurns = Math.max(1, options.maxTurns || 8)
  const emit = options.emit || (() => undefined)
  const widgets: DebugWidget[] = []
  const input: JsonObject[] = [{ role: 'user', content: options.prompt }]

  await emit({ type: 'run.started', runId, provider: options.provider || 'custom', model, prompt: options.prompt })

  try {
    for (let turn = 1; turn <= maxTurns; turn += 1) {
      options.signal?.throwIfAborted()
      await emit({ type: 'turn.started', turn })
      const response = await options.driver.complete({
        model,
        instructions: buildMiniAgentPrompt(options.extraInstructions),
        input,
        tools: visualizeTools,
        reasoningEffort: options.reasoningEffort || 'low',
        signal: options.signal,
      }, emit)
      await emit({ type: 'model.response', responseId: response.id, usage: response.usage })

      input.push(...response.output)
      const calls = functionCalls(response.output)
      if (!calls.length) {
        const result = { runId, turns: turn, text: response.outputText, widgets }
        await emit({ type: 'run.completed', ...result })
        return result
      }

      for (const call of calls) {
        options.signal?.throwIfAborted()
        const callId = String(call.call_id)
        const name = String(call.name)
        const args = parseArguments(call.arguments, name)
        await emit({ type: 'tool.started', callId, name, arguments: args })
        const toolResult = await executeVisualizeTool(name, args)
        await emit({ type: 'tool.completed', callId, name, output: toolResult.output })
        if (toolResult.widget) {
          widgets.push(toolResult.widget)
          await emit({ type: 'widget.completed', callId, widget: toolResult.widget })
        }
        input.push({
          type: 'function_call_output',
          call_id: callId,
          output: toolResult.output,
        })
      }
    }

    throw new Error(`Mini-agent exceeded maxTurns=${maxTurns}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await emit({ type: 'run.failed', runId, message })
    throw error
  }
}
