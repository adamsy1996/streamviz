import code from './generated'
import type { HomeDemoCase } from '../types'

export const mockupEnergyResilienceCase: HomeDemoCase = {
  id: 'energy-resilience',
  callId: 'call_streamviz_energy_resilience',
  visualizeType: 'mockup',
  title: 'Northgate microgrid command center',
  titleZh: 'Northgate 社区微电网指挥中心',
  prompt: 'Monitor a neighborhood microgrid during a heatwave outage and protect critical community services.',
  promptZh: '监控热浪停电期间的社区微电网，并保障关键公共服务。',
  readyMessage: 'Critical services are protected while the microgrid balances generation, reserves, and flexible demand.',
  readyMessageZh: '微电网在平衡发电、储能和弹性负载的同时，持续保障关键公共服务。',
  loadingMessages: ['Opening resilience command center', 'Syncing islanded grid telemetry', 'Drawing live energy flow'],
  loadingMessagesZh: ['正在打开韧性能源指挥中心', '正在同步孤岛电网遥测', '正在绘制实时能量流'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
