import { mkdir, writeFile } from 'node:fs/promises'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { DeepSeekChatDriver } from './deepseekDriver'
import { MockModelDriver } from './mockDriver'
import { OpenAIResponsesDriver } from './openaiDriver'
import { runMiniAgent } from './runtime'
import type { DebugWidget, ModelDriver } from './types'

type Scenario = {
  id: string
  prompt: string
  chartPalette?: 'series' | 'series-or-status'
}

const scenarios: Scenario[] = [
  {
    id: 'multi-series-chart',
    chartPalette: 'series',
    prompt: 'Create an accessible compact line chart comparing revenue and operating cost over the last six months. Include a legend, exact values, and a one-sentence insight.',
  },
  {
    id: 'agent-flow-diagram',
    prompt: 'Create an accessible flow diagram for a research agent: user request, planner, parallel search and database tools, synthesis, human approval, and final response. Show the failure path clearly.',
  },
  {
    id: 'operations-dashboard',
    chartPalette: 'series-or-status',
    prompt: 'Create a responsive incident operations dashboard with four metrics, a severity breakdown chart, three active incidents, and clear status badges. Keep it useful on a phone.',
  },
  {
    id: 'interactive-estimator',
    prompt: 'Create a compact interactive cloud cost estimator with two range inputs, a live monthly total, an accessible explanation, and a button that can send a follow-up prompt.',
  },
]

export const inspectWidget = (widget: DebugWidget, scenario: Scenario) => {
  const code = widget.widget_code
  const usesSeriesPalette = /--sv-chart-series-[1-8]/i.test(code)
  const usesStatusPalette = /--sv-(?:text|status)-(?:info|success|warning|danger)/i.test(code)
  const checks = {
    accessibleName: /aria-(?:label|labelledby)|<title\b|class=["'][^"']*sr-only/i.test(code),
    semanticStyling: /--sv-|\bsv-[a-z]/i.test(code),
    responsiveLayout: /grid|flex|viewBox|@media/i.test(code),
    readableText: !/font-size\s*:\s*(?:[0-9]|10)(?:px)?\b/i.test(code),
    noProhibitedEffects: !/gradient\s*\(|box-shadow|filter\s*:|backdrop-filter|position\s*:\s*fixed/i.test(code),
    chartPalette: !scenario.chartPalette
      || usesSeriesPalette
      || (scenario.chartPalette === 'series-or-status' && usesStatusPalette),
  }
  const passed = Object.values(checks).filter(Boolean).length
  return { checks, passed, total: Object.keys(checks).length, pass: passed === Object.keys(checks).length }
}

const loadLocalEnv = () => {
  try {
    loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)))
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
}

const main = async () => {
  loadLocalEnv()
  const mock = process.argv.includes('--mock')
  const provider = process.env.AGENT_PROVIDER === 'openai' ? 'openai' : 'deepseek'
  const model = provider === 'deepseek'
    ? process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'
    : process.env.OPENAI_MODEL || 'gpt-5.6-sol'
  const apiKey = provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY
  if (!mock && !apiKey) throw new Error(`${provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'} is required`)

  const driver: ModelDriver = mock
    ? new MockModelDriver()
    : provider === 'deepseek'
      ? new DeepSeekChatDriver({ apiKey: apiKey || '', baseURL: process.env.DEEPSEEK_BASE_URL })
      : new OpenAIResponsesDriver({ apiKey: apiKey || '', baseURL: process.env.OPENAI_BASE_URL })
  const selected = mock ? scenarios.slice(0, 1) : scenarios
  const startedAt = new Date().toISOString()
  const outputDir = fileURLToPath(new URL(`../../../.streamviz/evals/${startedAt.replace(/[:.]/g, '-')}/`, import.meta.url))
  await mkdir(outputDir, { recursive: true })

  const results = []
  for (const scenario of selected) {
    process.stderr.write(`[eval] ${scenario.id}\n`)
    const result = await runMiniAgent({
      driver,
      prompt: scenario.prompt,
      provider: mock ? 'mock' : provider,
      model,
      reasoningEffort: 'low',
      maxTurns: 8,
    })
    const widget = result.widgets.at(-1)
    const inspection = widget ? inspectWidget(widget, scenario) : null
    const record = {
      id: scenario.id,
      prompt: scenario.prompt,
      turns: result.turns,
      widget: widget || null,
      inspection,
    }
    results.push(record)
    await writeFile(`${outputDir}${scenario.id}.json`, `${JSON.stringify(record, null, 2)}\n`)
  }

  const summary = {
    startedAt,
    provider: mock ? 'mock' : provider,
    model,
    passed: results.filter((result) => result.inspection?.pass).length,
    total: results.length,
    results: results.map(({ id, turns, inspection }) => ({ id, turns, inspection })),
  }
  await writeFile(`${outputDir}summary.json`, `${JSON.stringify(summary, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\nResults: ${outputDir}\n`)
  if (summary.passed !== summary.total) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
