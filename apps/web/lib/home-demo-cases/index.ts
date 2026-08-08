import { artAgentConstellationCase } from './art-agent-constellation/case'
import { chartModelRoutingCase } from './chart-model-routing/case'
import { diagramAgentSequenceCase } from './diagram-agent-sequence/case'
import { interactiveAgentBudgetCase } from './interactive-agent-budget/case'
import { mockupIncidentResponseCase } from './mockup-incident-response/case'

export type { HomeDemoCase } from './types'

export const homeDemoCases = [
  diagramAgentSequenceCase,
  chartModelRoutingCase,
  interactiveAgentBudgetCase,
  mockupIncidentResponseCase,
  artAgentConstellationCase,
] as const
