import code from './generated'
import type { HomeDemoCase } from '../types'

export const mockupEnergyResilienceCase: HomeDemoCase = {
  id: 'energy-resilience',
  callId: 'call_streamviz_energy_resilience',
  visualizeType: 'mockup',
  title: 'Northgate microgrid command center',
  prompt: 'Monitor a neighborhood microgrid during a heatwave outage and protect critical community services.',
  readyMessage: 'Critical services are protected while the microgrid balances generation, reserves, and flexible demand.',
  loadingMessages: ['Opening resilience command center', 'Syncing islanded grid telemetry', 'Drawing live energy flow'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
