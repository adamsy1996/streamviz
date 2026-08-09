const DEFAULT_MASTRA_URL = 'http://127.0.0.1:4111'
const DEFAULT_AGENT_ID = 'streamviz-agent'
const DEFAULT_RESOURCE_ID = 'local-user'

type MastraAgentSummary = {
  modelId?: string
  provider?: string
}

const getMastraConfig = () => ({
  baseUrl: (process.env.MASTRA_AGENT_URL || DEFAULT_MASTRA_URL).replace(/\/$/, ''),
  agentId: process.env.MASTRA_AGENT_ID || DEFAULT_AGENT_ID,
  resourceId: process.env.MASTRA_RESOURCE_ID || DEFAULT_RESOURCE_ID,
})

export async function getPublicMastraAgentConfig() {
  const config = getMastraConfig()
  try {
    const response = await fetch(`${config.baseUrl}/api/agents`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`Mastra returned HTTP ${response.status}`)
    const agents = await response.json() as Record<string, MastraAgentSummary>
    const agent = agents[config.agentId]
    if (!agent) throw new Error(`Mastra agent ${config.agentId} was not found`)
    return {
      provider: agent.provider?.split('.')[0] || 'mastra',
      model: agent.modelId || 'unknown',
      configured: true,
    }
  } catch {
    return { provider: 'mastra', model: 'offline', configured: false }
  }
}

export async function streamMastraAgent(options: {
  prompt: string
  threadId: string
  signal: AbortSignal
}) {
  const config = getMastraConfig()
  return fetch(`${config.baseUrl}/api/agents/${encodeURIComponent(config.agentId)}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: options.prompt }],
      memory: {
        thread: options.threadId,
        resource: config.resourceId,
      },
    }),
    cache: 'no-store',
    signal: options.signal,
  })
}
