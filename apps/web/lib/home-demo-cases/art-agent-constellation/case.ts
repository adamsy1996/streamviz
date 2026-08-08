import code from './generated'
import type { HomeDemoCase } from '../types'

export const artAgentConstellationCase: HomeDemoCase = {
  id: 'agent-constellation',
  callId: 'call_streamviz_agent_constellation',
  visualizeType: 'art',
  title: 'The agent constellation',
  titleZh: 'Agent 星图',
  prompt: 'Visualize how an agent forms an answer as a generative illustration.',
  promptZh: '用生成式插画表现 Agent 如何形成答案。',
  readyMessage: 'The constellation traces a signal through reasoning, memory, tools, and the final response.',
  readyMessageZh: '星图呈现信号如何经过推理、记忆与工具，最终汇聚成回答。',
  loadingMessages: ['Drawing the constellation', 'Wiring the reasoning core', 'Seeding streaming tokens'],
  loadingMessagesZh: ['正在绘制星图', '正在连接推理核心', '正在播撒流式 token'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
