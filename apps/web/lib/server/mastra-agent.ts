const DEFAULT_MASTRA_URL = 'http://127.0.0.1:4111'
const DEFAULT_AGENT_ID = 'streamviz-agent'
const DEFAULT_RESOURCE_ID = 'local-user'

type MastraAgentSummary = {
  modelId?: string
  provider?: string
}

export type MastraThread = {
  id: string
  title?: string
  resourceId: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown> | null
}

type MastraMessagePart = {
  type?: string
  text?: string
  toolInvocation?: {
    state?: string
    toolCallId?: string
    toolName?: string
    args?: unknown
    result?: unknown
  }
}

type MastraMessage = {
  id: string
  role: string
  createdAt?: string
  content?: {
    content?: string
    parts?: MastraMessagePart[]
  }
}

type MastraThreadList = {
  threads?: MastraThread[]
  total?: number
  page?: number
  perPage?: number
  hasMore?: boolean
}

type MastraMessageList = {
  messages?: MastraMessage[]
}

const getMastraConfig = () => ({
  baseUrl: (process.env.MASTRA_AGENT_URL || DEFAULT_MASTRA_URL).replace(/\/$/, ''),
  agentId: process.env.MASTRA_AGENT_ID || DEFAULT_AGENT_ID,
  resourceId: process.env.MASTRA_RESOURCE_ID || DEFAULT_RESOURCE_ID,
})

const buildMemoryUrl = (path: string, extra?: Record<string, string>) => {
  const config = getMastraConfig()
  const url = new URL(`${config.baseUrl}/api${path}`)
  url.searchParams.set('agentId', config.agentId)
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => url.searchParams.set(key, value))
  }
  return { config, url }
}

async function fetchMastraJson<T>(url: URL, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  if (!response.ok) {
    const failure = await response.json().catch(() => ({ error: `Mastra returned HTTP ${response.status}` })) as { error?: string }
    throw new Error(failure.error || `Mastra returned HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

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
      maxSteps: 5,
      memory: {
        thread: options.threadId,
        resource: config.resourceId,
      },
    }),
    cache: 'no-store',
    signal: options.signal,
  })
}

export async function listMastraThreads() {
  const resourceId = getMastraConfig().resourceId
  const { config, url } = buildMemoryUrl('/memory/threads', {
    resourceId,
    perPage: '100',
    page: '0',
    orderBy: JSON.stringify({ field: 'updatedAt', direction: 'DESC' }),
  })
  const result = await fetchMastraJson<MastraThreadList>(url)
  return {
    threads: (result.threads || []).filter(thread => thread.resourceId === config.resourceId),
    total: result.total || 0,
    hasMore: Boolean(result.hasMore),
  }
}

export async function getMastraThreadMessages(threadId: string) {
  const resourceId = getMastraConfig().resourceId
  const { config, url } = buildMemoryUrl(`/memory/threads/${encodeURIComponent(threadId)}/messages`, {
    resourceId,
    perPage: '200',
    page: '0',
    orderBy: JSON.stringify({ field: 'createdAt', direction: 'ASC' }),
  })
  const result = await fetchMastraJson<MastraMessageList>(url)
  return (result.messages || [])
    .filter(message => message.role === 'user' || message.role === 'assistant')
    .map(message => ({
      id: message.id,
      role: message.role as 'user' | 'assistant',
      text: message.content?.parts
        ?.filter(part => part.type === 'text' && typeof part.text === 'string')
        .map(part => part.text)
        .join('') || message.content?.content || '',
      createdAt: message.createdAt,
      toolInvocations: message.content?.parts
        ?.filter(part => part.type === 'tool-invocation' && part.toolInvocation)
        .map(part => part.toolInvocation) || [],
      resourceId: config.resourceId,
    }))
}

export async function updateMastraThread(threadId: string, title: string) {
  const { config, url } = buildMemoryUrl(`/memory/threads/${encodeURIComponent(threadId)}`)
  return fetchMastraJson<MastraThread>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, resourceId: config.resourceId }),
  })
}

export async function deleteMastraThread(threadId: string) {
  const resourceId = getMastraConfig().resourceId
  const { url } = buildMemoryUrl(`/memory/threads/${encodeURIComponent(threadId)}`, {
    resourceId,
  })
  return fetchMastraJson<{ result: string }>(url, { method: 'DELETE' })
}
