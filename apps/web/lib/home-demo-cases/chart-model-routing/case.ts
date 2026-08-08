import code from './generated'
import type { HomeDemoCase } from '../types'

export const chartModelRoutingCase: HomeDemoCase = {
  id: 'model-routing',
  callId: 'call_streamviz_model_routing',
  visualizeType: 'chart',
  title: 'Model routing performance',
  titleZh: '模型路由性能分析',
  prompt: 'Compare our dynamic model routing performance with the static baseline.',
  promptZh: '对比动态模型路由与静态基线的性能。',
  readyMessage: 'Dynamic routing cuts P95 latency and cost while preserving task success.',
  readyMessageZh: '动态路由在保持任务成功率的同时降低了 P95 延迟和成本。',
  loadingMessages: ['Building the routing chart', 'Plotting seven-day P95 by route', 'Comparing cost vs success'],
  loadingMessagesZh: ['正在构建路由图表', '正在绘制七日 P95 路由曲线', '正在比较成本与成功率'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
