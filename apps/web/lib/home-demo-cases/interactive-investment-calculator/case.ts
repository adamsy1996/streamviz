import code from './generated'
import type { HomeDemoCase } from '../types'

export const interactiveInvestmentCalculatorCase: HomeDemoCase = {
  id: 'investment-calculator',
  callId: 'call_streamviz_investment_calculator',
  visualizeType: 'interactive',
  title: 'Long-term investment calculator',
  prompt: 'Help me explore how contributions, compounding, fees, and inflation shape a long-term investment.',
  readyMessage: 'Adjust any assumption to recalculate the projections and growth curves immediately.',
  loadingMessages: ['Setting up assumptions', 'Projecting growth paths', 'Rendering the chart'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
