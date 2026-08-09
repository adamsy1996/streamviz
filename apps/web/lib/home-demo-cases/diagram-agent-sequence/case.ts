import code from './generated'
import type { HomeDemoCase } from '../types'

export const diagramAgentSequenceCase: HomeDemoCase = {
  id: 'agent-sequence',
  callId: 'call_streamviz_sequence',
  visualizeType: 'diagram',
  title: 'Agent conversation streaming sequence',
  prompt: 'Create an Agent conversation system sequence diagram.',
  readyMessage: 'The sequence makes the boundary from raw SSE to a live conversation artifact visible.',
  loadingMessages: ['Mapping participants…', 'Streaming messages…', 'Rendering boundary…'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
