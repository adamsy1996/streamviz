import { buildVisualizeSystemPrompt } from '../../../src/protocol/index'

export function buildMiniAgentPrompt(extraInstructions = '') {
  return [
    'You are the local StreamViz integration-debug agent.',
    'Exercise the registered visualization tools exactly as a production host would.',
    'Use tools only when the user asks for a visual artifact. Otherwise answer normally.',
    'Keep the final text brief because the visualization is rendered separately.',
    buildVisualizeSystemPrompt(),
    extraInstructions.trim(),
  ].filter(Boolean).join('\n\n')
}
