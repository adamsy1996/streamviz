import code from './generated'
import type { HomeDemoCase } from '../types'

export const chartModelRoutingCase: HomeDemoCase = {
  id: 'model-routing',
  callId: 'call_streamviz_model_routing',
  visualizeType: 'chart',
  title: 'Model routing performance',
  prompt: 'Compare our dynamic model routing performance with the static baseline.',
  readyMessage: 'Dynamic routing cuts P95 latency and cost while preserving task success.',
  loadingMessages: ['Building the routing chart', 'Plotting seven-day P95 by route', 'Comparing cost vs success'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
