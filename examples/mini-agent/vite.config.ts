import { randomUUID } from 'node:crypto'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { DeepSeekChatDriver } from './src/deepseekDriver'
import { OpenAIResponsesDriver } from './src/openaiDriver'
import { runMiniAgent } from './src/runtime'
import { TraceWriter } from './src/trace'
import type { AgentEvent, EventSink } from './src/types'

try {
  loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url)))
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
}

const readBody = (request: import('node:http').IncomingMessage) => new Promise<string>((resolve, reject) => {
  let body = ''
  request.setEncoding('utf8')
  request.on('data', (chunk) => {
    body += chunk
    if (body.length > 100_000) reject(new Error('Request body is too large'))
  })
  request.on('end', () => resolve(body))
  request.on('error', reject)
})

const configuredProvider = () => process.env.AGENT_PROVIDER === 'deepseek' ? 'deepseek' : 'openai'
const configuredModel = (provider: 'openai' | 'deepseek') => provider === 'deepseek'
  ? process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
  : process.env.OPENAI_MODEL || 'gpt-5.6-sol'

function agentApiPlugin(): Plugin {
  return {
    name: 'streamviz-mini-agent-api',
    configureServer(server) {
      server.middlewares.use('/api/config', (request, response, next) => {
        if (request.method !== 'GET') return next()
        const provider = configuredProvider()
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(JSON.stringify({ provider, model: configuredModel(provider) }))
      })

      server.middlewares.use('/api/agent', async (request, response, next) => {
        if (request.method !== 'POST') return next()
        const controller = new AbortController()
        response.on('close', () => {
          if (!response.writableEnded) controller.abort()
        })

        try {
          const parsed = JSON.parse(await readBody(request)) as { prompt?: unknown }
          const prompt = String(parsed.prompt || '').trim()
          if (!prompt) {
            response.statusCode = 400
            response.end('Prompt is required')
            return
          }
          const provider = configuredProvider()
          const model = configuredModel(provider)
          const apiKey = provider === 'deepseek'
            ? process.env.DEEPSEEK_API_KEY || ''
            : process.env.OPENAI_API_KEY || ''
          if (!apiKey) throw new Error(`${provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'} is not configured`)

          response.writeHead(200, {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
          })
          const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`
          const trace = new TraceWriter(runId)
          await trace.initialize()
          const emit: EventSink = async (event: AgentEvent) => {
            await trace.sink(event)
            if (!response.destroyed) response.write(`${JSON.stringify(event)}\n`)
          }
          const driver = provider === 'deepseek'
            ? new DeepSeekChatDriver({ apiKey, baseURL: process.env.DEEPSEEK_BASE_URL })
            : new OpenAIResponsesDriver({ apiKey, baseURL: process.env.OPENAI_BASE_URL })
          const result = await runMiniAgent({
            driver,
            prompt,
            provider,
            model,
            reasoningEffort: 'low',
            maxTurns: 8,
            signal: controller.signal,
            emit,
            runId,
          })
          await trace.finalize(result)
          if (!response.destroyed) response.end()
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          if (!response.headersSent) {
            response.statusCode = controller.signal.aborted ? 499 : 500
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ error: message }))
          } else if (!response.destroyed) {
            response.write(`${JSON.stringify({ type: 'server.error', message })}\n`)
            response.end()
          }
        }
      })
    },
  }
}

export default defineConfig({
  root: fileURLToPath(new URL('./web', import.meta.url)),
  plugins: [react(), agentApiPlugin()],
  server: {
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
})
