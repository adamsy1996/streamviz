import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  StreamVisualization,
  buildVisualizeSystemPrompt,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'
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

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
