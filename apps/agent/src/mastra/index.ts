import { Mastra } from '@mastra/core/mastra'
import { MastraStorageExporter, Observability } from '@mastra/observability'
import { streamvizAgent } from './agents/streamviz-agent.js'
import { storage } from './config/storage.js'

export const mastra = new Mastra({
  agents: { streamvizAgent },
  storage,
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'streamviz-agent',
        exporters: [new MastraStorageExporter()],
      },
    },
  }),
})
