import { describe, expect, it } from 'vitest'
import { inspectWidget } from './eval'

describe('visual evaluation rules', () => {
  it('accepts an accessible semantic chart', () => {
    const result = inspectWidget({
      kind: 'visualize_widget',
      title: 'Chart',
      loading_messages: [],
      mode: 'iframe',
      widget_code: '<section class="sv-grid" aria-label="Trend"><svg viewBox="0 0 10 10"><path stroke="var(--sv-chart-series-1)" /></svg></section>',
    }, { id: 'chart', prompt: 'chart', chartPalette: 'series' })
    expect(result.pass).toBe(true)
  })

  it('rejects effects and tiny text', () => {
    const result = inspectWidget({
      kind: 'visualize_widget',
      title: 'Bad',
      loading_messages: [],
      mode: 'iframe',
      widget_code: '<div style="font-size:9px;box-shadow:0 2px 8px #000">Bad</div>',
    }, { id: 'bad', prompt: 'bad' })
    expect(result.pass).toBe(false)
    expect(result.checks.readableText).toBe(false)
    expect(result.checks.noProhibitedEffects).toBe(false)
  })
})
