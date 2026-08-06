import { describe, expect, it } from 'vitest'
import { estimateWidgetHeight, widgetSourceHasRenderableContent } from './content'
import { buildExportDocument, safeExportName } from './export'
import { serializeThemeCssVars } from './theme'

describe('React renderer helpers', () => {
  it('keeps incomplete markup out of the renderer', () => {
    expect(widgetSourceHasRenderableContent('<section')).toBe(false)
    expect(widgetSourceHasRenderableContent('<section>Ready</section>')).toBe(true)
    expect(estimateWidgetHeight('<p>Ready</p>', false)).toBe(48)
  })

  it('builds safe standalone HTML exports', () => {
    expect(safeExportName('Risk/Matrix?')).toBe('Risk-Matrix-')
    expect(buildExportDocument('<main>Ready</main>', 'Risk <Matrix>')).toContain('<title>Risk Matrix</title>')
  })

  it('rejects theme declaration injection while preserving semantic aliases', () => {
    const css = serializeThemeCssVars({
      tokens: { accent: '#635bff', backgroundMuted: '#f1f3f5', textPrimary: 'red;}body{display:none' },
    })
    expect(css).toContain('--sv-accent:#635bff;')
    expect(css).toContain('--sem-accent-primary:#635bff;')
    expect(css).toContain('--sv-bg-muted:#f1f3f5;')
    expect(css).toContain('--sem-bg-muted:#f1f3f5;')
    expect(css).not.toContain('display:none')
  })
})
