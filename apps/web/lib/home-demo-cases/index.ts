import { artUrbanWaterCycleCase } from './art-urban-water-cycle/case'
import { chartModelRoutingCase } from './chart-model-routing/case'
import { diagramAgentSequenceCase } from './diagram-agent-sequence/case'
import { interactiveInvestmentCalculatorCase } from './interactive-investment-calculator/case'
import { mockupEnergyResilienceCase } from './mockup-energy-resilience/case'

export type { HomeDemoCase } from './types'

export const homeDemoCases = [
  diagramAgentSequenceCase,
  chartModelRoutingCase,
  interactiveInvestmentCalculatorCase,
  mockupEnergyResilienceCase,
  artUrbanWaterCycleCase,
] as const
