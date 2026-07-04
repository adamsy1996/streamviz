import { describe, expect, it } from 'vitest'
import {
  PROJECT_VISUALIZE_README_RELATIVE_PATH,
  VISUALIZE_README_FILE,
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  VISUALIZE_TYPES,
  VISUALIZE_WIDGET_KIND,
  VISUALIZE_WIDGET_MODE,
  buildVisualizeReadMeMetadata,
  buildVisualizeReadMeOutput,
  buildVisualizeReadMeTitle,
  buildVisualizeShowWidgetOutput,
  buildVisualizeSystemPrompt,
  buildVisualizeWidgetMetadata,
  fallbackVisualizeReadme,
} from './index'

describe('streamviz protocol', () => {
  it('exposes stable tool names and visualization types', () => {
    expect(VISUALIZE_READ_ME_TOOL_NAME).toBe('visualize_read_me')
    expect(VISUALIZE_SHOW_WIDGET_TOOL_NAME).toBe('visualize_show_widget')
    expect(VISUALIZE_TYPES).toEqual(['diagram', 'chart', 'interactive', 'mockup', 'art'])
    expect(VISUALIZE_README_FILE).toBe('visualize.readme.md')
    expect(PROJECT_VISUALIZE_README_RELATIVE_PATH).toBe('.opencode/visualize/readme.md')
  })

  it('builds the model-facing system prompt around the visualization tools', () => {
    const prompt = buildVisualizeSystemPrompt()

    expect(prompt).toContain('Platform visualization protocol')
    expect(prompt).toContain(VISUALIZE_READ_ME_TOOL_NAME)
    expect(prompt).toContain(VISUALIZE_SHOW_WIDGET_TOOL_NAME)
    expect(prompt).toContain('diagram, chart, interactive, mockup, art')
  })

  it('builds readme outputs and metadata', () => {
    expect(buildVisualizeReadMeTitle('chart')).toBe('Loaded visualize rules: chart')
    expect(buildVisualizeReadMeOutput({
      type: 'chart',
      content: 'Rules for {{type}}',
    })).toBe('<visualize_read_me type="chart">\nRules for chart\n</visualize_read_me>')
    expect(buildVisualizeReadMeMetadata({
      type: 'chart',
      source: 'package',
    })).toEqual({ type: 'chart', source: 'package' })
  })

  it('builds widget metadata and final tool output', () => {
    const metadata = buildVisualizeWidgetMetadata({
      title: 'Risk Matrix',
      widget_code: '<section>Risk</section>',
      loading_messages: ['Preparing matrix'],
    })

    expect(metadata).toEqual({
      kind: VISUALIZE_WIDGET_KIND,
      title: 'Risk Matrix',
      widget_code: '<section>Risk</section>',
      loading_messages: ['Preparing matrix'],
      mode: VISUALIZE_WIDGET_MODE,
    })
    expect(buildVisualizeShowWidgetOutput('Risk Matrix')).toContain('已展示可视化预览：Risk Matrix')
  })

  it('ships fallback readme guidance for hosts without the markdown asset', () => {
    expect(fallbackVisualizeReadme).toContain('# Visualize Widget Rules')
    expect(fallbackVisualizeReadme).toContain(VISUALIZE_SHOW_WIDGET_TOOL_NAME)
  })
})
