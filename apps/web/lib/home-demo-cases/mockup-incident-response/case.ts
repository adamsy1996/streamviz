import code from './generated'
import type { HomeDemoCase } from '../types'

export const mockupIncidentResponseCase: HomeDemoCase = {
  id: 'incident-response',
  callId: 'call_streamviz_incident',
  visualizeType: 'mockup',
  title: 'INC-4821 checkout incident dashboard',
  titleZh: 'INC-4821 结账事故响应看板',
  prompt: 'Investigate the checkout latency spike and build a live incident dashboard.',
  promptZh: '调查结账延迟突增，并生成一个实时事故响应看板。',
  readyMessage: 'The incident is contained. The live dashboard keeps the response state in the conversation.',
  readyMessageZh: '事故已得到控制，实时看板会在对话中持续保留响应状态。',
  loadingMessages: ['Correlating deploy #4821', 'Shifting checkout traffic to healthy replica', 'Rendering incident surface'],
  loadingMessagesZh: ['正在关联部署 #4821', '正在将结账流量切换到健康副本', '正在渲染事故响应界面'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
