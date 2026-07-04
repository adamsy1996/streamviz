import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  StreamVisualization,
  buildVisualizeSystemPrompt,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'
import './styles.css'

const finalWidget = [
  '<section style="padding:20px 0;">',
  '  <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:16px;align-items:stretch;">',
  '    <article style="border:1px solid var(--sem-border-subtle);border-radius:12px;padding:18px;background:var(--sem-bg-card);">',
  '      <p style="margin:0;color:var(--sem-text-tertiary);font-size:13px;">Agent artifact</p>',
  '      <h2 style="margin:6px 0 8px;font-size:28px;line-height:1.1;">Revenue cockpit</h2>',
  '      <p style="margin:0 0 16px;color:var(--sem-text-secondary);">The widget streamed as tool-call JSON, then became interactive only after final.</p>',
  '      <svg viewBox="0 0 520 180" role="img" aria-label="Revenue trend" style="width:100%;height:auto;display:block;">',
  '        <rect x="0" y="0" width="520" height="180" rx="16" fill="var(--sem-bg-surface)" />',
  '        <path d="M40 132 C110 112 132 66 202 82 C274 98 306 34 382 54 C430 66 458 46 482 28" fill="none" stroke="var(--sem-accent-primary)" stroke-width="8" stroke-linecap="round" />',
  '        <circle cx="482" cy="28" r="10" fill="var(--sem-status-success)" />',
  '      </svg>',
  '    </article>',
  '    <article style="border:1px solid var(--sem-border-subtle);border-radius:12px;padding:18px;background:var(--sem-bg-card);">',
  '      <p style="margin:0;color:var(--sem-text-tertiary);font-size:13px;">Follow-up</p>',
  '      <p style="margin:6px 0 16px;font-size:18px;color:var(--sem-text-primary);">Widgets can ask the host to continue the conversation.</p>',
  '      <button id="ask-agent">Ask the agent</button>',
  '    </article>',
  '  </div>',
  '  <script>',
  '    document.body.dataset.finalScript = "enabled";',
  '    document.getElementById("ask-agent")?.addEventListener("click", () => sendPrompt("Explain the revenue risk behind this artifact"));',
  '  </script>',
  '</section>',
].join('')

const finalWidgetForMode = (e2eMode: boolean) => e2eMode
  ? finalWidget.replace(
    '</script>',
    'setTimeout(() => sendPrompt("Browser e2e prompt"), 120);</script>',
  )
  : finalWidget

const loadingMessages = [
  'Receiving streamed tool-call JSON',
  'Detecting renderable artifact content',
  'Waiting for final interactive code',
]

const createToolCall = (phase: number, e2eMode = false) => {
  const widgetCode = finalWidgetForMode(e2eMode)
  if (phase === 0) {
    return {
      tool_status: 'running',
      raw: '{"title":"Revenue cockpit","loading_messages":["Receiving streamed tool-call JSON"],"widget_code":"<section',
    }
  }

  if (phase === 1) {
    return {
      tool_status: 'running',
      raw: JSON.stringify({
        title: 'Revenue cockpit',
        loading_messages: loadingMessages,
        widget_code: widgetCode.slice(0, 860),
      }).slice(0, -6),
    }
  }

  return {
    tool_status: 'done',
    metadata: {
      title: 'Revenue cockpit',
      widget_code: widgetCode,
      loading_messages: loadingMessages,
    },
  }
}

function App() {
  const e2eMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('e2e') === '1'
  const [phase, setPhase] = useState(e2eMode ? 2 : 0)
  const [prompts, setPrompts] = useState<string[]>([])
  const toolCall = useMemo(() => createToolCall(phase, e2eMode), [phase, e2eMode])
  const payload = extractVisualizeWidgetPayload(toolCall)
  const systemPromptLine = buildVisualizeSystemPrompt().split('\n')[0]

  useEffect(() => {
    if (e2eMode) return undefined
    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % 3)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [e2eMode])

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">streamviz</p>
          <h1>AI agent visual artifacts, rendered while tool calls stream.</h1>
          <p className="lede">
            A drop-in React renderer, sandboxed iframe runtime, and shared agent protocol for
            generated dashboards, charts, diagrams, and interactive widgets.
          </p>
          <div className="hero-actions">
            <a href="#quick-start">Quick start</a>
            <a href="#protocol">Agent protocol</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Package summary">
          <p>{systemPromptLine}</p>
          <dl>
            <div>
              <dt>API</dt>
              <dd>StreamVisualization</dd>
            </div>
            <div>
              <dt>Styles</dt>
              <dd>streamviz/styles.css</dd>
            </div>
            <div>
              <dt>Boundary</dt>
              <dd>Sandboxed iframe</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="demo-section" aria-label="Live streaming demo">
        <div className="section-heading">
          <p className="eyebrow">Live demo</p>
          <h2>Partial JSON to final interactive artifact</h2>
        </div>
        <div className="phase-tabs">
          <button type="button" className={phase === 0 ? 'is-active' : ''} onClick={() => setPhase(0)}>partial JSON</button>
          <button type="button" className={phase === 1 ? 'is-active' : ''} onClick={() => setPhase(1)}>renderable chunk</button>
          <button type="button" className={phase === 2 ? 'is-active' : ''} onClick={() => setPhase(2)}>final artifact</button>
        </div>
        <StreamVisualization
          title={payload.title}
          code={payload.code}
          exportCode={payload.exportCode}
          loadingMessage={payload.loadingMessage}
          loadingMessages={payload.loadingMessages}
          final={payload.final}
          notify={(message) => console.log(message)}
          onSendPrompt={(prompt) => setPrompts((current) => [prompt, ...current].slice(0, 4))}
        />
        {prompts.length ? (
          <div className="prompt-log">
            <strong>Host received</strong>
            {prompts.map((prompt, index) => (
              <span key={`${prompt}-${index}`}>{prompt}</span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid-section" id="quick-start">
        <article>
          <p className="eyebrow">Quick start</p>
          <h2>One component for the UI boundary</h2>
          <pre>{`import {
  StreamVisualization,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'

const payload = extractVisualizeWidgetPayload(toolCall)

<StreamVisualization
  title={payload.title}
  code={payload.code}
  exportCode={payload.exportCode}
  loadingMessages={payload.loadingMessages}
  final={payload.final}
/>`}</pre>
        </article>

        <article id="protocol">
          <p className="eyebrow">Agent protocol</p>
          <h2>Stable tool names for backends</h2>
          <pre>{`import {
  buildVisualizeSystemPrompt,
  buildVisualizeWidgetMetadata,
} from 'streamviz/protocol'

const system = buildVisualizeSystemPrompt()
const metadata = buildVisualizeWidgetMetadata({
  title,
  widget_code,
  loading_messages,
})`}</pre>
        </article>
      </section>

      <section className="feature-row" aria-label="Core package features">
        <div>
          <h3>Streaming aware</h3>
          <p>Extracts useful strings from incomplete tool-call JSON and releases rendering only when content is useful.</p>
        </div>
        <div>
          <h3>Security first</h3>
          <p>Uses sandbox, CSP, active-content stripping, and final-only script execution for untrusted generated widgets.</p>
        </div>
        <div>
          <h3>Host friendly</h3>
          <p>Inject icons, toast, clipboard, theme, and follow-up prompt callbacks without exposing arbitrary host APIs.</p>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
