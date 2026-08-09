import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import {
  VISUALIZE_LOADING_MESSAGES_DESCRIPTION,
  VISUALIZE_READ_ME_TOOL_DESCRIPTION,
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_DESCRIPTION,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  VISUALIZE_TYPES,
  VISUALIZE_TYPE_DESCRIPTION,
  VISUALIZE_WIDGET_CODE_DESCRIPTION,
  VISUALIZE_WIDGET_TITLE_DESCRIPTION,
  buildVisualizeReadMeOutput,
  buildVisualizeWidgetMetadata,
  fallbackVisualizeReadme,
} from '../../../../../src/protocol/index.js'

async function readVisualizeGuide() {
  const invocationRoot = process.env.INIT_CWD
  const candidates = [
    resolve(process.cwd(), 'src/protocol/visualize.readme.md'),
    resolve(process.cwd(), '../../src/protocol/visualize.readme.md'),
    ...(invocationRoot
      ? [
          resolve(invocationRoot, 'src/protocol/visualize.readme.md'),
          resolve(invocationRoot, '../../src/protocol/visualize.readme.md'),
        ]
      : []),
  ]

  for (const candidate of new Set(candidates)) {
    try {
      return await readFile(candidate, 'utf8')
    } catch {
      // Try the next monorepo-relative location.
    }
  }

  return fallbackVisualizeReadme
}

export const visualizeReadMeTool = createTool({
  id: VISUALIZE_READ_ME_TOOL_NAME,
  description: VISUALIZE_READ_ME_TOOL_DESCRIPTION,
  inputSchema: z.object({
    type: z.enum(VISUALIZE_TYPES).describe(VISUALIZE_TYPE_DESCRIPTION),
  }),
  outputSchema: z.object({ guide: z.string() }),
  execute: async ({ type }) => ({
    guide: buildVisualizeReadMeOutput({ type, content: await readVisualizeGuide() }),
  }),
})

export const visualizeShowWidgetTool = createTool({
  id: VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  description: VISUALIZE_SHOW_WIDGET_TOOL_DESCRIPTION,
  inputSchema: z.object({
    loading_messages: z.array(z.string().min(1)).min(1).max(3)
      .describe(VISUALIZE_LOADING_MESSAGES_DESCRIPTION),
    widget_code: z.string().min(1).describe(VISUALIZE_WIDGET_CODE_DESCRIPTION),
    title: z.string().min(1).describe(VISUALIZE_WIDGET_TITLE_DESCRIPTION),
  }),
  outputSchema: z.object({
    message: z.string(),
    artifact: z.object({
      kind: z.literal('visualize_widget'),
      title: z.string(),
      widget_code: z.string(),
      loading_messages: z.array(z.string()),
      mode: z.literal('iframe'),
    }),
  }),
  execute: async (input) => ({
    message: `Rendered visualization: ${input.title}.`,
    artifact: {
      ...buildVisualizeWidgetMetadata(input),
      loading_messages: [...input.loading_messages],
    },
  }),
})
