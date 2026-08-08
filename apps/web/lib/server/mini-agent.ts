import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import path from 'node:path'
import {
  DeepSeekChatDriver,
  MockModelDriver,
  OpenAIResponsesDriver,
  runMiniAgent,
  type AgentEvent,
  type EventSink,
} from '@streamviz/mini-agent/server'

export type AgentProvider = 'deepseek' | 'openai' | 'mock'

let localEnvLoaded = false

function loadLocalEnv() {
  if (localEnvLoaded || process.env.NODE_ENV === 'production') return
  localEnvLoaded = true
  const candidates = [
    path.resolve(process.cwd(), 'examples/mini-agent/.env'),
    path.resolve(process.cwd(), '../../examples/mini-agent/.env'),
  ]
  const file = candidates.find(existsSync)
  if (file) loadEnvFile(file)
}

export function getAgentConfig() {
  loadLocalEnv()
  const provider: AgentProvider = process.env.STREAMVIZ_AGENT_MOCK === '1'
    ? 'mock'
    : process.env.AGENT_PROVIDER === 'openai' ? 'openai' : 'deepseek'
  const model = provider === 'mock'
    ? 'mock-streamviz'
    : provider === 'deepseek'
    ? process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
    : process.env.OPENAI_MODEL || 'gpt-5.6-sol'
  const apiKey = provider === 'mock' ? 'mock' : provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY
  return { provider, model, configured: provider === 'mock' || Boolean(apiKey), apiKey: apiKey || '' }
}

export function getPublicAgentConfig() {
  const { provider, model, configured } = getAgentConfig()
  return { provider, model, configured }
}

export async function streamAgentRun(options: {
  prompt: string
  signal: AbortSignal
  emit: EventSink
}) {
  const config = getAgentConfig()
  if (!config.configured) {
    throw new Error(`${config.provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'} is not configured on the server`)
  }
  const driver = config.provider === 'mock'
    ? new MockModelDriver()
    : config.provider === 'deepseek'
    ? new DeepSeekChatDriver({ apiKey: config.apiKey, baseURL: process.env.DEEPSEEK_BASE_URL })
    : new OpenAIResponsesDriver({ apiKey: config.apiKey, baseURL: process.env.OPENAI_BASE_URL })

  return runMiniAgent({
    driver,
    prompt: options.prompt,
    provider: config.provider,
    model: config.model,
    reasoningEffort: 'low',
    maxTurns: 8,
    signal: options.signal,
    emit: options.emit,
  })
}

export type { AgentEvent }
