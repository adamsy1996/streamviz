import code from './generated'
import type { HomeDemoCase } from '../types'

export const artUrbanWaterCycleCase: HomeDemoCase = {
  id: 'urban-water-cycle',
  callId: 'call_streamviz_urban_water_cycle',
  visualizeType: 'art',
  title: 'The city after rain',
  prompt: 'Visualize an urban water cycle as a continuous cityscape above and below ground.',
  readyMessage: 'Rain is slowed, cleaned, stored, and returned through a resilient city landscape.',
  loadingMessages: ['Drafting the skyline', 'Flowing water through the section', 'Finishing the water cycle'],
  code,
  codeAtProgress: progress => code.slice(0, Math.floor(code.length * progress / 100)),
}
