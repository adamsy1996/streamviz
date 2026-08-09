import { readFile } from 'node:fs/promises'
import {
  VISUALIZE_READ_ME_TOOL_DESCRIPTION,
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_DESCRIPTION,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  VISUALIZE_TYPES,
  VISUALIZE_TYPE_DESCRIPTION,
  VISUALIZE_LOADING_MESSAGES_DESCRIPTION,
  VISUALIZE_WIDGET_CODE_DESCRIPTION,
  VISUALIZE_WIDGET_TITLE_DESCRIPTION,
  buildVisualizeReadMeOutput,
  buildVisualizeShowWidgetOutput,
  buildVisualizeWidgetMetadata,
  fallbackVisualizeReadme,
  type VisualizeType,
} from '../../../src/protocol/index'
import type { DebugWidget, JsonObject, ModelTool } from './types'

const visualizeReadmeUrl = new URL('../../../src/protocol/visualize.readme.md', import.meta.url)

export const visualizeTools: ModelTool[] = [
  {
    type: 'function',
    name: VISUALIZE_READ_ME_TOOL_NAME,
    description: VISUALIZE_READ_ME_TOOL_DESCRIPTION,
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: VISUALIZE_TYPES,
          description: VISUALIZE_TYPE_DESCRIPTION,
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: VISUALIZE_SHOW_WIDGET_TOOL_NAME,
    description: VISUALIZE_SHOW_WIDGET_TOOL_DESCRIPTION,
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        loading_messages: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 3,
          description: VISUALIZE_LOADING_MESSAGES_DESCRIPTION,
        },
        widget_code: {
          type: 'string',
          description: VISUALIZE_WIDGET_CODE_DESCRIPTION,
        },
        title: {
          type: 'string',
          description: VISUALIZE_WIDGET_TITLE_DESCRIPTION,
        },
      },
      required: ['loading_messages', 'widget_code', 'title'],
      additionalProperties: false,
    },
  },
]

const asNonEmptyString = (value: unknown, field: string) => {
  const normalized = String(value ?? '').trim()
  if (!normalized) throw new Error(`${field} must be a non-empty string`)
  return normalized
}

const readVisualizeGuide = async () => {
  try {
    return await readFile(visualizeReadmeUrl, 'utf8')
  } catch {
    return fallbackVisualizeReadme
  }
}

export async function executeVisualizeTool(name: string, args: JsonObject): Promise<{
  output: string
  widget?: DebugWidget
}> {
  if (name === VISUALIZE_READ_ME_TOOL_NAME) {
    const type = asNonEmptyString(args.type, 'type')
    if (!VISUALIZE_TYPES.includes(type as VisualizeType)) {
      throw new Error(`Unsupported visualization type: ${type}`)
    }
    return {
      output: buildVisualizeReadMeOutput({ type, content: await readVisualizeGuide() }),
    }
  }

  if (name === VISUALIZE_SHOW_WIDGET_TOOL_NAME) {
    const loadingMessages = Array.isArray(args.loading_messages)
      ? args.loading_messages.slice(0, 3).map((value) => asNonEmptyString(value, 'loading_messages'))
      : []
    if (!loadingMessages.length) throw new Error('loading_messages must contain at least one message')
    const input = {
      loading_messages: loadingMessages,
      widget_code: asNonEmptyString(args.widget_code, 'widget_code'),
      title: asNonEmptyString(args.title, 'title'),
    }
    return {
      output: buildVisualizeShowWidgetOutput(input.title),
      widget: buildVisualizeWidgetMetadata(input),
    }
  }

  throw new Error(`Unknown tool: ${name}`)
}
