import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  StreamVisualization,
  buildVisualizeSystemPrompt,
  extractVisualizeWidgetPayload,
} from 'streamviz-react'
import 'streamviz-react/styles.css'
import './styles.css'

const widgetCode = [
  '<section style="padding: 1rem 0;">',
  '  <h2 class="sr-only">A compact release readiness dashboard with three status cards.</h2>',
  '  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">',
  '    <article style="background:var(--sem-bg-card);border:1px solid var(--sem-border-subtle);border-radius:8px;padding:1rem;">',
  '      <p style="margin:0;color:var(--sem-text-secondary);font-size:13px;">Tests</p>',
  '      <p style="margin:4px 0 0;font-size:24px;font-weight:600;">128 passed</p>',
  '    </article>',
  '    <article style="background:var(--sem-bg-card);border:1px solid var(--sem-border-subtle);border-radius:8px;padding:1rem;">',
  '      <p style="margin:0;color:var(--sem-text-secondary);font-size:13px;">Risk</p>',
  '      <p style="margin:4px 0 0;font-size:24px;font-weight:600;">Low</p>',
  '    </article>',
  '    <article style="background:var(--sem-bg-card);border:1px solid var(--sem-border-subtle);border-radius:8px;padding:1rem;">',
  '      <p style="margin:0;color:var(--sem-text-secondary);font-size:13px;">Deploy</p>',
  '      <button style="margin-top:8px;" onclick="sendPrompt(\'Create a deployment checklist\')">Checklist</button>',
  '    </article>',
  '  </div>',
  '  <script>document.body.dataset.demoFinal = "true";</script>',
  '</section>',
].join('')

const loadingMessages = [
  'Reading tool-call arguments',
  'Laying out dashboard',
  'Waiting for final artifact',
]

const query = new URLSearchParams(window.location.search)
const visualRegressionMode = query.get('visual') === '1'
const visualTheme = query.get('theme') === 'dark' ? 'dark' : 'light'
if (visualRegressionMode) document.documentElement.dataset.theme = visualTheme

const visualFixtureCode = `
  <section class="sv-stack" style="padding:4px 0 12px">
    <h2 class="sr-only">Release health overview with metrics, trend chart, and deployment status.</h2>
    <div class="sv-grid">
      <article class="sv-metric"><p class="sv-label">Availability</p><p class="sv-value">99.98%</p><p class="sv-muted">Healthy</p></article>
      <article class="sv-metric"><p class="sv-label">P95 latency</p><p class="sv-value">184 ms</p><p class="sv-muted">12 ms faster</p></article>
      <article class="sv-metric"><p class="sv-label">Error budget</p><p class="sv-value">82%</p><p class="sv-muted">24 days left</p></article>
    </div>
    <article class="sv-card">
      <div class="sv-cluster" style="justify-content:space-between"><div><p class="sv-label">Requests</p><p style="margin:2px 0 0;font-weight:600">Seven-day traffic</p></div><span class="sv-badge sv-badge-success">+14.2%</span></div>
      <svg viewBox="0 0 640 190" role="img" aria-labelledby="chart-title chart-desc">
        <title id="chart-title">Requests over seven days</title><desc id="chart-desc">Traffic rises steadily from Monday to Sunday.</desc>
        <g stroke="var(--sv-border-subtle)" stroke-width="1"><path d="M42 24H620M42 74H620M42 124H620M42 174H620"/></g>
        <path d="M42 153L138 131L234 140L330 91L426 105L522 57L620 35" fill="none" stroke="var(--sv-chart-series-1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <g fill="var(--sv-chart-series-1)"><circle cx="42" cy="153" r="5"/><circle cx="138" cy="131" r="5"/><circle cx="234" cy="140" r="5"/><circle cx="330" cy="91" r="5"/><circle cx="426" cy="105" r="5"/><circle cx="522" cy="57" r="5"/><circle cx="620" cy="35" r="5"/></g>
        <g class="ts" font-size="12" text-anchor="middle"><text x="42" y="188">Mon</text><text x="138" y="188">Tue</text><text x="234" y="188">Wed</text><text x="330" y="188">Thu</text><text x="426" y="188">Fri</text><text x="522" y="188">Sat</text><text x="620" y="188">Sun</text></g>
      </svg>
    </article>
    <article class="sv-card sv-cluster" style="justify-content:space-between"><div><p style="margin:0;font-weight:600">Production deploy</p><p class="sv-muted" style="margin:2px 0 0">All 128 checks passed</p></div><button class="sv-action" onclick="sendPrompt('Create the deployment checklist')">Open checklist</button></article>
  </section>`

function VisualRegressionFixture() {
  return (
    <main className="visual-regression-page" data-visual-regression={visualTheme}>
      <section className="visual-regression-shell">
        <header className="visual-regression-header">
          <div><p className="eyebrow">streamviz / visual baseline</p><h1>Release command center</h1></div>
          <span className="fixture-status">Live</span>
        </header>
        <StreamVisualization
          title="Release health"
          code={visualFixtureCode}
          exportCode={visualFixtureCode}
          final
          loadingMessage="Preparing dashboard"
          notify={() => undefined}
          onSendPrompt={() => undefined}
          theme={{ mode: visualTheme }}
        />
      </section>
    </main>
  )
}

const buildToolCall = (step: number) => {
  if (step <= 0) {
    return {
      tool_status: 'running',
      raw: '{"title":"Release readiness","loading_messages":["Reading tool-call arguments","Laying out dashboard"],"widget_code":"<section',
    }
  }

  if (step === 1) {
    return {
      tool_status: 'running',
      raw: JSON.stringify({
        title: 'Release readiness',
        loading_messages: loadingMessages,
        widget_code: widgetCode.slice(0, 480),
      }).slice(0, -3),
    }
  }

  return {
    tool_status: 'done',
    metadata: {
      title: 'Release readiness',
      widget_code: widgetCode,
      loading_messages: loadingMessages,
    },
  }
}

function App() {
  const [step, setStep] = useState(0)
  const [prompts, setPrompts] = useState<string[]>([])
  const toolCall = useMemo(() => buildToolCall(step), [step])
  const payload = extractVisualizeWidgetPayload(toolCall)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep((current) => (current >= 2 ? 0 : current + 1))
    }, 2400)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <main>
      <section className="intro">
        <p className="eyebrow">streamviz</p>
        <h1>AI agent visual artifacts, rendered while tool calls stream</h1>
        <p>{buildVisualizeSystemPrompt().split('\n')[0]}</p>
      </section>

      <div className="demo-shell">
        <div className="demo-toolbar" aria-label="streaming state">
          <span className={step === 0 ? 'is-active' : ''}>partial JSON</span>
          <span className={step === 1 ? 'is-active' : ''}>renderable chunk</span>
          <span className={step === 2 ? 'is-active' : ''}>final artifact</span>
        </div>

        <StreamVisualization
          title={payload.title}
          code={payload.code}
          exportCode={payload.exportCode}
          loadingMessage={payload.loadingMessage}
          loadingMessages={payload.loadingMessages}
          final={payload.final}
          notify={(message) => console.log(message)}
          onSendPrompt={(prompt) => setPrompts((current) => [prompt, ...current].slice(0, 3))}
        />
      </div>

      {prompts.length ? (
        <section className="prompt-log" aria-label="prompts from widget">
          <h2>Prompts from widget</h2>
          {prompts.map((prompt, index) => (
            <p key={`${prompt}-${index}`}>{prompt}</p>
          ))}
        </section>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(
  visualRegressionMode ? <VisualRegressionFixture /> : <App />,
)
