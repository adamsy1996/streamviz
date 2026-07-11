import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const runtimeCss = readFileSync('src/theme/visualize-widget-runtime.css', 'utf8')

describe('visualize widget runtime palette', () => {
  it('ships stable semantic colors instead of browser-dependent system colors', () => {
    expect(runtimeCss).toContain('--sv-slate-1: #fcfcfd')
    expect(runtimeCss).toContain('--sv-indigo-9: #3e63dd')
    expect(runtimeCss).toContain('--sv-status-success: var(--sv-jade-9)')
    expect(runtimeCss).toContain('--sv-chart-series-8: #46a758')
    expect(runtimeCss).toContain('--color-background-primary: var(--sv-bg-surface)')
    expect(runtimeCss).toContain('--sem-accent-primary: var(--sv-accent)')
    expect(runtimeCss).not.toMatch(/\b(?:ActiveText|LinkText|MarkText|CanvasText)\b/)
  })

  it('keeps diagram ramps aligned with the documented palette', () => {
    expect(runtimeCss).toContain('--c-purple-fill: #eeedfe')
    expect(runtimeCss).toContain('--c-teal-title: #085041')
    expect(runtimeCss).toContain('--c-coral-fill: #712b13')
    expect(runtimeCss).toContain('--c-pink-title: #f4c0d1')
    expect(runtimeCss).toContain('--c-blue-fill: #e6f1fb')
    expect(runtimeCss).toContain('--c-green-title: #c0dd97')
  })
})
