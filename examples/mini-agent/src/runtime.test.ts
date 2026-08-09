import { describe, expect, it } from 'vitest'
import { MockModelDriver } from './mockDriver'
import { toDeepSeekMessages, toDeepSeekTools } from './deepseekDriver'
import { buildMiniAgentPrompt } from './prompt'
import { runMiniAgent } from './runtime'
import type { AgentEvent, ModelDriver } from './types'
import { visualizeTools } from './visualizeTools'

describe('mini-agent runtime', () => {
  it('runs the read-guide, show-widget, final-answer loop', async () => {
    const events: AgentEvent[] = []
    const result = await runMiniAgent({
      driver: new MockModelDriver(),
      prompt: 'Create a revenue chart',
      runId: 'test-run',
      emit: (event) => {
        events.push(event)
      },
    })

    expect(result.turns).toBe(3)
    expect(result.widgets).toHaveLength(1)
    expect(result.widgets[0]).toMatchObject({
      kind: 'visualize_widget',
      title: 'Revenue trend',
      mode: 'iframe',
    })
    expect(events.some((event) => event.type === 'tool.started' && event.name === 'visualize_read_me')).toBe(true)
    expect(events.some((event) => event.type === 'widget.completed')).toBe(true)
  })

  it('fails deterministically when the model never stops calling tools', async () => {
    const driver: ModelDriver = {
      complete: async () => ({
        id: 'loop',
        outputText: '',
        output: [{
          type: 'function_call',
          call_id: 'read-again',
          name: 'visualize_read_me',
          arguments: '{"type":"chart"}',
        }],
      }),
    }

    await expect(runMiniAgent({
      driver,
      prompt: 'Loop',
      maxTurns: 2,
    })).rejects.toThrow('exceeded maxTurns=2')
  })

  it('stops before calling the model when the run is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(runMiniAgent({
      driver: new MockModelDriver(),
      prompt: 'Do not run',
      signal: controller.signal,
    })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('keeps the prompt and tool schemas aligned with the package protocol', () => {
    expect(buildMiniAgentPrompt()).toContain('visualize_read_me')
    expect(buildMiniAgentPrompt()).toContain('visualize_show_widget')
    expect(visualizeTools.map((tool) => tool.name)).toEqual([
      'visualize_read_me',
      'visualize_show_widget',
    ])
    expect(visualizeTools[1].parameters).toMatchObject({
      required: ['loading_messages', 'widget_code', 'title'],
      additionalProperties: false,
    })
  })

  it('maps the neutral runtime history to DeepSeek Chat Completions', () => {
    const messages = toDeepSeekMessages('System', [
      { role: 'user', content: 'Draw a chart' },
      {
        type: 'chat_message',
        role: 'assistant',
        content: '',
        tool_calls: [{
          id: 'call-1',
          type: 'function',
          function: { name: 'visualize_read_me', arguments: '{"type":"chart"}' },
        }],
      },
      { type: 'function_call', call_id: 'call-1', name: 'visualize_read_me', arguments: '{"type":"chart"}' },
      { type: 'function_call_output', call_id: 'call-1', output: 'rules' },
    ])

    expect(messages).toEqual([
      { role: 'system', content: 'System' },
      { role: 'user', content: 'Draw a chart' },
      {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'call-1',
          type: 'function',
          function: { name: 'visualize_read_me', arguments: '{"type":"chart"}' },
        }],
      },
      { role: 'tool', tool_call_id: 'call-1', content: 'rules' },
    ])
    expect(toDeepSeekTools(visualizeTools)[0]).toMatchObject({
      type: 'function',
      function: { name: 'visualize_read_me' },
    })
  })
})
