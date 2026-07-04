import { describe, expect, it } from 'vitest'
import {
  extractPartialJsonString,
  extractPartialJsonStringArray,
  extractVisualizeWidgetPayload,
  visualizeWidgetSourceKey,
} from './visualizeWidgetTool'

describe('streamviz tool payload parsing', () => {
  it('extracts partial streamed string values before JSON is complete', () => {
    const raw = '{"title":"Revenue \\\"North\\\"","widget_code":"<section>Loading'

    expect(extractPartialJsonString(raw, 'title')).toBe('Revenue "North"')
    expect(extractPartialJsonString(raw, 'widget_code')).toBe('<section>Loading')
  })

  it('extracts partial streamed string arrays', () => {
    const raw = '{"loading_messages":["Preparing chart","Rendering table'

    expect(extractPartialJsonStringArray(raw, 'loading_messages')).toEqual([
      'Preparing chart',
      'Rendering table',
    ])
  })

  it('normalizes partial and final visualize widget payloads', () => {
    const running = extractVisualizeWidgetPayload({
      tool_status: 'running',
      raw: '{"title":"Risk","widget_code":"<section>partial',
    })

    expect(running).toMatchObject({
      title: 'Risk',
      code: '<section>partial',
      exportCode: '<section>partial',
      final: false,
      status: 'running',
    })

    const final = extractVisualizeWidgetPayload({
      tool_status: 'done',
      metadata: {
        title: 'Risk Matrix',
        widget_code: '<section>complete</section>',
        loading_messages: ['Calculating risk'],
      },
    })

    expect(final).toMatchObject({
      title: 'Risk Matrix',
      code: '<section>complete</section>',
      exportCode: '<section>complete</section>',
      loadingMessage: 'Calculating risk',
      loadingMessages: ['Calculating risk'],
      final: true,
      status: 'done',
    })
  })

  it('builds stable source keys', () => {
    expect(visualizeWidgetSourceKey('<section>A</section>')).toBe(visualizeWidgetSourceKey('<section>A</section>'))
    expect(visualizeWidgetSourceKey('<section>A</section>')).not.toBe(visualizeWidgetSourceKey('<section>B</section>'))
  })
})
