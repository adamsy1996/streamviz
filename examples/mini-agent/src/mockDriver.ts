import type { EventSink, ModelDriver, ModelRequest, ModelResponse } from './types'

const sampleWidget = [
  '<section class="sv-stack" style="padding:var(--sv-space-4) 0">',
  '<h2 class="sr-only">Six month revenue trend</h2>',
  '<div class="sv-grid">',
  '<div class="sv-metric"><span class="sv-label">Revenue</span><strong class="sv-value">$1.24m</strong></div>',
  '<div class="sv-metric"><span class="sv-label">Growth</span><strong class="sv-value">18%</strong></div>',
  '</div>',
  '<div class="sv-card"><span class="sv-muted">Mock mode validates the complete tool loop without an API key.</span></div>',
  '</section>',
].join('')

export class MockModelDriver implements ModelDriver {
  private turn = 0

  async complete(_request: ModelRequest, emit: EventSink): Promise<ModelResponse> {
    this.turn += 1
    if (this.turn === 1) {
      const args = '{"type":"chart"}'
      await emit({ type: 'model.tool.delta', callId: 'mock-read', name: 'visualize_read_me', delta: args })
      return {
        id: 'mock-response-1',
        outputText: '',
        output: [{ type: 'function_call', call_id: 'mock-read', name: 'visualize_read_me', arguments: args }],
      }
    }
    if (this.turn === 2) {
      const args = JSON.stringify({
        loading_messages: ['Preparing revenue data', 'Drawing the trend'],
        widget_code: sampleWidget,
        title: 'Revenue trend',
      })
      await emit({ type: 'model.tool.delta', callId: 'mock-widget', name: 'visualize_show_widget', delta: args })
      return {
        id: 'mock-response-2',
        outputText: '',
        output: [{ type: 'function_call', call_id: 'mock-widget', name: 'visualize_show_widget', arguments: args }],
      }
    }
    const text = 'The mock visualization is ready.'
    await emit({ type: 'model.text.delta', delta: text })
    return {
      id: 'mock-response-3',
      outputText: text,
      output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] }],
    }
  }
}
