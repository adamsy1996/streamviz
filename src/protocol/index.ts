export const VISUALIZE_TYPES = ['diagram', 'chart', 'interactive', 'mockup', 'art'] as const

export type VisualizeType = (typeof VISUALIZE_TYPES)[number]

export const VISUALIZE_READ_ME_TOOL_NAME = 'visualize_read_me'
export const VISUALIZE_SHOW_WIDGET_TOOL_NAME = 'visualize_show_widget'
export const VISUALIZE_WIDGET_KIND = 'visualize_widget'
export const VISUALIZE_WIDGET_MODE = 'iframe'
export const VISUALIZE_README_FILE = 'visualize.readme.md'
export const PROJECT_VISUALIZE_README_RELATIVE_PATH = '.opencode/visualize/readme.md'

export const VISUALIZE_TYPE_DESCRIPTION =
  'The visualization module to read: diagram, chart, interactive, mockup, or art.'

export const VISUALIZE_LOADING_MESSAGES_DESCRIPTION =
  'Required short loading messages to show before widget_code starts streaming. Provide at most 3 messages.'

export const VISUALIZE_WIDGET_CODE_DESCRIPTION =
  'Complete HTML/SVG widget source. Follow the loaded visualization rules for styling, scripts, and approved CDN resources.'

export const VISUALIZE_WIDGET_TITLE_DESCRIPTION =
  'Short widget title, also used as the export filename.'

export const VISUALIZE_READ_ME_TOOL_DESCRIPTION =
  'Read visualization design rules before creating a widget.'

export const VISUALIZE_SHOW_WIDGET_TOOL_DESCRIPTION =
  'Render a self-contained HTML/SVG visualization widget in the chat iframe artifact renderer.'

export const fallbackVisualizeReadme = [
  '# Visualize Widget Rules',
  '',
  '- Render a self-contained widget fragment.',
  '- Use platform CSS tokens and keep the wrapper transparent.',
  `- Call \`${VISUALIZE_SHOW_WIDGET_TOOL_NAME}\` with required \`loading_messages\` (max 3), \`widget_code\`, and \`title\`, in that order.`,
].join('\n')

export function buildVisualizeSystemPrompt() {
  return [
    'Platform visualization protocol:',
    '- For user requests to draw, visualize, chart, diagram, mock up, dashboard, calculator, tabbed interactive UI, or other visual artifacts, use the platform visualization tools instead of the skill tool.',
    `- First call ${VISUALIZE_READ_ME_TOOL_NAME} with the closest type: ${VISUALIZE_TYPES.join(', ')}.`,
    `- Then call ${VISUALIZE_SHOW_WIDGET_TOOL_NAME} with required loading_messages (max 3), a self-contained HTML/SVG widget_code, and title, in that order.`,
    '- Do not load live-html-chart or any visualization skill. Do not mention hidden/internal visualization implementation details to the user.',
    `- If the user explicitly asks for an HTML code block or source code, answer with normal Markdown code instead of ${VISUALIZE_SHOW_WIDGET_TOOL_NAME}.`,
  ].join('\n')
}

export function buildVisualizeReadMeTitle(type: VisualizeType | string) {
  return `Loaded visualize rules: ${type}`
}

export function buildVisualizeReadMeOutput(input: { type: VisualizeType | string; content: string }) {
  return [
    `<${VISUALIZE_READ_ME_TOOL_NAME} type="${input.type}">`,
    input.content.replaceAll('{{type}}', String(input.type)),
    `</${VISUALIZE_READ_ME_TOOL_NAME}>`,
  ].join('\n')
}

export function buildVisualizeReadMeMetadata(input: { type: VisualizeType | string; source: string }) {
  return { type: input.type, source: input.source }
}

export type VisualizeWidgetInput = {
  title: string
  widget_code: string
  loading_messages: readonly string[]
}

export function buildVisualizeShowWidgetOutput(title: string) {
  return `已展示可视化预览：${title}。不要逐项复述组件内容；只在正常回复中补充必要结论或下一步。`
}

export function buildVisualizeWidgetMetadata(input: VisualizeWidgetInput) {
  return {
    kind: VISUALIZE_WIDGET_KIND,
    title: input.title,
    widget_code: input.widget_code,
    loading_messages: input.loading_messages,
    mode: VISUALIZE_WIDGET_MODE,
  } as const
}
