import { randomUUID } from 'node:crypto'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { DeepSeekChatDriver } from './deepseekDriver'
import { MockModelDriver } from './mockDriver'
import { OpenAIResponsesDriver } from './openaiDriver'
import { runMiniAgent } from './runtime'
import { TraceWriter } from './trace'
import type { AgentEvent, EventSink } from './types'

type CliOptions = {
  prompt: string
  provider: 'openai' | 'deepseek'
  model: string
  reasoningEffort: 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  maxTurns: number
  mock: boolean
}

const help = `Usage:
  npm run agent:debug -- "Create a compact revenue chart"
  npm run agent:debug -- --provider deepseek --model deepseek-v4-flash "Create a flow diagram"
  npm run agent:debug:mock

Options:
  --mock                 Run the complete tool loop without an API key
  --provider <name>      openai or deepseek
  --model <id>           Override the provider's configured model
  --reasoning <effort>   none, low, medium, high, xhigh, max (default: low)
  --max-turns <number>   Maximum model/tool turns (default: 8)
  --help                 Show this message`

const parseCli = (argv: string[]): CliOptions => {
  const words: string[] = []
  let provider: CliOptions['provider'] = process.env.AGENT_PROVIDER === 'deepseek' ? 'deepseek' : 'openai'
  let model = ''
  let reasoningEffort: CliOptions['reasoningEffort'] = 'low'
  let maxTurns = 8
  let mock = false

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--help' || value === '-h') {
      process.stdout.write(`${help}\n`)
      process.exit(0)
    } else if (value === '--mock') {
      mock = true
    } else if (value === '--provider') {
      const next = argv[++index]
      if (next !== 'openai' && next !== 'deepseek') throw new Error(`Invalid provider: ${next}`)
      provider = next
    } else if (value === '--model') {
      model = argv[++index] || model
    } else if (value === '--reasoning') {
      const next = argv[++index] as CliOptions['reasoningEffort']
      if (!['none', 'low', 'medium', 'high', 'xhigh', 'max'].includes(next)) {
        throw new Error(`Invalid reasoning effort: ${next}`)
      }
      reasoningEffort = next
    } else if (value === '--max-turns') {
      maxTurns = Number.parseInt(argv[++index] || '', 10)
      if (!Number.isFinite(maxTurns) || maxTurns < 1) throw new Error('--max-turns must be a positive integer')
    } else {
      words.push(value)
    }
  }

  const prompt = words.join(' ').trim()
  if (!prompt) throw new Error(`A prompt is required.\n\n${help}`)
  model ||= provider === 'deepseek'
    ? process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
    : process.env.OPENAI_MODEL || 'gpt-5.6-sol'
  return { prompt, provider, model, reasoningEffort, maxTurns, mock }
}

const printEvent: EventSink = (event: AgentEvent) => {
  if (event.type === 'turn.started') process.stderr.write(`\n[turn ${event.turn}]\n`)
  else if (event.type === 'model.text.delta') process.stdout.write(event.delta)
  else if (event.type === 'tool.started') process.stderr.write(`[tool] ${event.name} ${JSON.stringify(event.arguments)}\n`)
  else if (event.type === 'widget.completed') process.stderr.write(`[widget] ${event.widget.title} (${event.widget.widget_code.length} chars)\n`)
  else if (event.type === 'run.failed') process.stderr.write(`[failed] ${event.message}\n`)
}

const main = async () => {
  try {
    loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  const options = parseCli(process.argv.slice(2))
  const apiKey = options.provider === 'deepseek'
    ? process.env.DEEPSEEK_API_KEY || ''
    : process.env.OPENAI_API_KEY || ''
  if (!options.mock && !apiKey) {
    const variable = options.provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'
    throw new Error(`${variable} is required for a live run. Use --mock to validate the local loop without credentials.`)
  }

  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`
  const trace = new TraceWriter(runId)
  await trace.initialize()
  const emit: EventSink = async (event) => {
    await printEvent(event)
    await trace.sink(event)
  }
  const driver = options.mock
    ? new MockModelDriver()
    : options.provider === 'deepseek'
      ? new DeepSeekChatDriver({ apiKey, baseURL: process.env.DEEPSEEK_BASE_URL })
      : new OpenAIResponsesDriver({ apiKey, baseURL: process.env.OPENAI_BASE_URL })

  const result = await runMiniAgent({
    driver,
    prompt: options.prompt,
    provider: options.mock ? 'mock' : options.provider,
    model: options.model,
    reasoningEffort: options.reasoningEffort,
    maxTurns: options.maxTurns,
    emit,
    runId,
  })
  await trace.finalize(result)
  process.stdout.write(`\n\nTrace: ${trace.tracePath}\n`)
  if (result.widgets.length) process.stdout.write(`Widgets: ${trace.directory}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
