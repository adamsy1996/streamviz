import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const runtimeCss = readFileSync('src/theme/visualize-widget-runtime.css', 'utf8')
const utilitiesCss = readFileSync('src/theme/visualize-widget-utilities.css', 'utf8')
const hostCss = readFileSync('src/theme/styles.css', 'utf8')

const relativeLuminance = (hex: string) => {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((value) => Number.parseInt(value, 16) / 255) || []
  return channels
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0)
}

const contrastRatio = (foreground: string, background: string) => {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

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

  it('keeps muted text readable in both runtime themes', () => {
    expect(contrastRatio('#6f737c', '#fcfcfd')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#7b7f88', '#111113')).toBeGreaterThanOrEqual(4.5)
    expect(runtimeCss).toContain('--sv-text-muted: #6f737c')
    expect(runtimeCss).toContain('--sv-text-muted: #7b7f88')
  })

  it('ships namespaced authoring primitives and a complete muted background alias', () => {
    expect(runtimeCss).toContain('--sem-bg-muted: var(--sv-bg-muted)')
    expect(utilitiesCss).toContain('.sv-grid')
    expect(utilitiesCss).toContain('.sv-card')
    expect(utilitiesCss).toContain('.sv-metric')
    expect(utilitiesCss).toContain('.sv-action')
    expect(utilitiesCss).not.toContain('@tailwind')
    expect(utilitiesCss).not.toContain('@apply')
  })

  it('owns host loading animation without relying on Tailwind utilities', () => {
    expect(hostCss).toContain('@keyframes visualize-widget-loading-pulse')
    expect(hostCss).toContain('@media (prefers-reduced-motion: reduce)')
    expect(hostCss).toContain('@media (max-width: 480px)')
    expect(hostCss).toContain('justify-content: flex-end')
    expect(hostCss).not.toContain('@apply')
    expect(hostCss).not.toContain('@tailwind')
  })
})
