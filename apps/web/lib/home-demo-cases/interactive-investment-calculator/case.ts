import code from './generated'
import type { HomeDemoCase } from '../types'

export const interactiveInvestmentCalculatorCase: HomeDemoCase = {
  id: 'investment-calculator',
  callId: 'call_streamviz_investment_calculator',
  visualizeType: 'interactive',
  title: 'Long-term investment calculator',
  titleZh: '长期投资计算器',
  prompt: 'Help me explore how contributions, compounding, fees, and inflation shape a long-term investment.',
  promptZh: '帮我计算定期投入、复利、费用和通胀如何影响长期投资。',
  readyMessage: 'Adjust any assumption to recalculate the projections and growth curves immediately.',
  readyMessageZh: '调整任意假设，即可实时重新计算预测结果和增长曲线。',
  loadingMessages: ['Setting up assumptions', 'Projecting growth paths', 'Rendering the chart'],
  loadingMessagesZh: ['正在设置投资假设', '正在计算增长路径', '正在渲染增长曲线'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
