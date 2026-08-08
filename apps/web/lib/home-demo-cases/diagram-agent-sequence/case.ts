import code from './generated'
import type { HomeDemoCase } from '../types'

export const diagramAgentSequenceCase: HomeDemoCase = {
  id: 'agent-sequence',
  callId: 'call_streamviz_sequence',
  visualizeType: 'diagram',
  title: 'Agent conversation streaming sequence',
  titleZh: 'Agent 对话流式时序图',
  prompt: 'Create an Agent conversation system sequence diagram.',
  promptZh: '生成一张 Agent 对话系统时序图。',
  readyMessage: 'The sequence makes the boundary from raw SSE to a live conversation artifact visible.',
  readyMessageZh: '时序图清晰呈现了原始 SSE 到对话内实时产物的边界。',
  loadingMessages: ['Mapping participants…', 'Streaming messages…', 'Rendering boundary…'],
  loadingMessagesZh: ['正在映射参与者…', '正在传递流式消息…', '正在渲染协议边界…'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
