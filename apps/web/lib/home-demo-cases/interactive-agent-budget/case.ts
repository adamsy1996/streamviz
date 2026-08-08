import code from './generated'
import type { HomeDemoCase } from '../types'

export const interactiveAgentBudgetCase: HomeDemoCase = {
  id: 'agent-autonomy-budget',
  callId: 'call_streamviz_agent_budget',
  visualizeType: 'interactive',
  title: 'Agent autonomy budget simulator',
  titleZh: 'Agent 自主预算模拟器',
  prompt: 'Help me tune the autonomy budget for this production agent.',
  promptZh: '帮我调整这个生产 Agent 的自主预算。',
  readyMessage: 'The simulator is interactive—tune the controls to explore quality, cost, latency, and risk.',
  readyMessageZh: '模拟器支持实时交互，可调整参数探索质量、成本、延迟和风险。',
  loadingMessages: ['Tuning agent autonomy…', 'Building the frontier…', 'Ready'],
  loadingMessagesZh: ['正在调整 Agent 自主度…', '正在构建决策前沿…', '交互界面已就绪'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
