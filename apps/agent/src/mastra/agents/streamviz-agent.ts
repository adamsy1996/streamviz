import { deepseek } from '@ai-sdk/deepseek'
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import {
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  buildVisualizeSystemPrompt,
} from '../../../../../src/protocol/index.js'
import { env } from '../config/env.js'
import { storage } from '../config/storage.js'
import { visualizeReadMeTool, visualizeShowWidgetTool } from '../tools/visualize.js'

if (!env.deepseekApiKey) {
  throw new Error('DEEPSEEK_API_KEY is required. Copy apps/agent/.env.example to apps/agent/.env.')
}

export const streamvizAgent = new Agent({
  id: 'streamviz-agent',
  name: 'StreamViz Agent',
  instructions: [
    'You are StreamViz, a concise and capable conversational assistant.',
    'Use the registered tools when the user asks for a visual artifact.',
    'When a tool returns an artifact, summarize only the important conclusion and do not repeat the entire artifact.',
    buildVisualizeSystemPrompt(),
  ].join('\n\n'),
  model: deepseek(env.deepseekModel),
  defaultOptions: {
    maxSteps: 5,
  },
  tools: {
    [VISUALIZE_READ_ME_TOOL_NAME]: visualizeReadMeTool,
    [VISUALIZE_SHOW_WIDGET_TOOL_NAME]: visualizeShowWidgetTool,
  },
  memory: new Memory({
    storage,
    options: {
      lastMessages: 20,
      generateTitle: true,
    },
  }),
})
