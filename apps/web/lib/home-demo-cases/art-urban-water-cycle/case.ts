import code from './generated'
import type { HomeDemoCase } from '../types'

export const artUrbanWaterCycleCase: HomeDemoCase = {
  id: 'urban-water-cycle',
  callId: 'call_streamviz_urban_water_cycle',
  visualizeType: 'art',
  title: 'The city after rain',
  titleZh: '雨后的城市',
  prompt: 'Visualize an urban water cycle as a continuous cityscape above and below ground.',
  promptZh: '用一张贯穿地上与地下的连续城市景观表现城市水循环。',
  readyMessage: 'Rain is slowed, cleaned, stored, and returned through a resilient city landscape.',
  readyMessageZh: '雨水在韧性城市景观中被减速、净化、储存，并重新回到城市。',
  loadingMessages: ['Drafting the skyline', 'Flowing water through the section', 'Finishing the water cycle'],
  loadingMessagesZh: ['正在勾勒城市天际线', '正在让水流穿过城市剖面', '正在完成城市水循环'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
