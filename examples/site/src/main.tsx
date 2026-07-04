import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  StreamVisualization,
  buildVisualizeSystemPrompt,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'
import './styles.css'

const phases = ['partial', 'chunk', 'final'] as const

const loadingMessages = [
  'Receiving streamed tool-call arguments',
  'Extracting the first renderable visual artifact',
  'Finalizing interactive iframe runtime',
]

const finalWidget = [
  '<section style="padding:18px 0;">',
  '  <style>',
  '    .sv-demo-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;align-items:stretch}',
  '    .sv-card{border:1px solid var(--sem-border-subtle);border-radius:10px;padding:16px;background:var(--sem-bg-card)}',
  '    .sv-kicker{margin:0;color:var(--sem-text-tertiary);font:600 12px/1.2 ui-sans-serif,system-ui}',
  '    .sv-title{margin:5px 0 8px;color:var(--sem-text-primary);font:650 24px/1.08 ui-sans-serif,system-ui}',
  '    .sv-copy{margin:0;color:var(--sem-text-secondary);font:400 13px/1.55 ui-sans-serif,system-ui}',
  '    .sv-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}',
  '    .sv-metric{border:1px solid var(--sem-border-subtle);border-radius:8px;padding:10px;background:var(--sem-bg-surface)}',
  '    .sv-metric strong{display:block;color:var(--sem-text-primary);font-size:18px}',
  '    .sv-metric span{color:var(--sem-text-tertiary);font-size:11px}',
  '    .sv-action{margin-top:14px;border:1px solid var(--sem-border-default);border-radius:8px;background:var(--sem-bg-surface);color:var(--sem-text-primary);padding:9px 11px;font:600 13px ui-sans-serif,system-ui;cursor:pointer}',
  '    @media(max-width:680px){.sv-demo-grid{grid-template-columns:1fr}.sv-metrics{grid-template-columns:1fr}}',
  '  </style>',
  '  <div class="sv-demo-grid">',
  '    <article class="sv-card">',
  '      <p class="sv-kicker">Agent artifact</p>',
  '      <h2 class="sv-title">Revenue cockpit</h2>',
  '      <p class="sv-copy">A generated dashboard streams in as tool-call JSON, renders as soon as usable, then becomes interactive after the final chunk.</p>',
  '      <svg viewBox="0 0 560 190" role="img" aria-label="Revenue trend" style="width:100%;height:auto;display:block;margin-top:14px;">',
  '        <rect x="0" y="0" width="560" height="190" rx="14" fill="var(--sem-bg-surface)" />',
  '        <path d="M42 134 C104 126 132 78 194 88 C260 100 298 40 360 54 C426 68 456 48 516 30" fill="none" stroke="var(--sem-accent-primary)" stroke-width="8" stroke-linecap="round" />',
  '        <path d="M42 148 C122 142 170 118 238 124 C316 132 362 92 426 92 C476 92 502 80 516 74" fill="none" stroke="var(--sem-status-warning)" stroke-width="5" stroke-linecap="round" opacity=".82" />',
  '        <circle cx="516" cy="30" r="9" fill="var(--sem-status-success)" />',
  '      </svg>',
  '    </article>',
  '    <article class="sv-card">',
  '      <p class="sv-kicker">Host bridge</p>',
  '      <h2 class="sv-title">Ask the agent</h2>',
  '      <p class="sv-copy">Generated widgets can request a narrow follow-up prompt without receiving privileged host APIs.</p>',
  '      <div class="sv-metrics">',
  '        <div class="sv-metric"><strong>12ms</strong><span>parse bench</span></div>',
  '        <div class="sv-metric"><strong>CSP</strong><span>iframe runtime</span></div>',
  '        <div class="sv-metric"><strong>React</strong><span>drop-in UI</span></div>',
  '      </div>',
  '      <button class="sv-action" id="ask-agent">Explain risk drivers</button>',
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

function createToolCall(phase: number, e2eMode = false) {
  const widgetCode = finalWidgetForMode(e2eMode)

  if (phase === 0) {
    return {
      tool_status: 'running',
      raw: '{"title":"Revenue cockpit","loading_messages":["Receiving streamed tool-call arguments"],"widget_code":"<section',
    }
  }

  if (phase === 1) {
    return {
      tool_status: 'running',
      raw: JSON.stringify({
        title: 'Revenue cockpit',
        loading_messages: loadingMessages,
        widget_code: widgetCode.slice(0, 980),
      }).slice(0, -7),
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

function CodeBlock({ children }: { children: string }) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  )
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
      setPhase((current) => (current + 1) % phases.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [e2eMode])

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="streamviz home">
          <span className="brand-mark">sv</span>
          <span>streamviz</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#demo">Demo</a>
          <a href="#install">Install</a>
          <a href="#protocol">Protocol</a>
          <a href="#security">Security</a>
        </nav>
        <a className="header-cta" href="https://github.com/adamsy1996/streamviz">GitHub</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="status-row">
              <span className="status-dot" />
              <span>Apache-2.0 package for AI agent UI</span>
            </div>
            <h1>Streaming visual artifacts for AI agents.</h1>
            <p className="lede">
              Stream tool-call JSON into sandboxed dashboards, charts, diagrams, and interactive
              widgets with one React component and a stable model protocol.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#install">Get started</a>
              <a className="button secondary" href="#demo">View live demo</a>
            </div>
            <div className="install-strip" id="install">
              <span>$</span>
              <code>npm install streamviz</code>
            </div>
            <div className="hero-metrics" aria-label="Package highlights">
              <div>
                <strong>React 18+</strong>
                <span>drop-in renderer</span>
              </div>
              <div>
                <strong>Apache-2.0</strong>
                <span>open source</span>
              </div>
              <div>
                <strong>Sandboxed</strong>
                <span>iframe runtime</span>
              </div>
            </div>
          </div>

          <aside className="hero-preview" aria-label="streamviz preview">
            <div className="window-bar">
              <span />
              <span />
              <span />
              <strong>streamviz runtime</strong>
            </div>
            <div className="product-preview">
              <div className="stream-panel">
                <p className="panel-label">Tool-call stream</p>
                <div className="stream-row is-done"><span />title</div>
                <div className="stream-row is-done"><span />loading_messages</div>
                <div className="stream-row is-active"><span />widget_code</div>
                <div className="stream-row"><span />final metadata</div>
              </div>
              <div className="artifact-preview">
                <div className="artifact-topline">
                  <span>Sandboxed artifact</span>
                  <strong>final</strong>
                </div>
                <svg viewBox="0 0 520 220" role="img" aria-label="Streamviz artifact preview">
                  <rect x="0" y="0" width="520" height="220" rx="18" fill="currentColor" opacity=".05" />
                  <rect x="28" y="28" width="142" height="54" rx="12" fill="currentColor" opacity=".09" />
                  <rect x="190" y="28" width="142" height="54" rx="12" fill="currentColor" opacity=".09" />
                  <rect x="352" y="28" width="140" height="54" rx="12" fill="currentColor" opacity=".09" />
                  <path d="M40 170 C94 146 128 116 184 126 C246 138 276 70 340 86 C390 98 422 56 480 42" fill="none" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round" />
                  <path d="M40 184 C118 176 176 154 232 160 C306 168 360 126 480 118" fill="none" stroke="var(--warning)" strokeWidth="5" strokeLinecap="round" opacity=".8" />
                  <circle cx="480" cy="42" r="10" fill="var(--success)" />
                </svg>
              </div>
            </div>
            <div className="preview-footer">
              <span>extract partial JSON</span>
              <span>render artifact</span>
              <span>bridge prompt</span>
            </div>
          </aside>
        </section>

        <section className="logo-row" aria-label="Positioning">
          <span>Built for streaming tool calls</span>
          <span>React 18+</span>
          <span>Sandboxed iframe</span>
          <span>Open Source. Open Code.</span>
        </section>

        <section className="demo-layout" id="demo">
          <div className="section-copy">
            <p className="eyebrow">Live renderer</p>
            <h2>From incomplete JSON to final interactive UI.</h2>
            <p>
              Streamviz is the visual counterpart to streaming Markdown renderers: it handles the
              unstable middle state while the model is still writing tool arguments.
            </p>
            <div className="phase-tabs" role="tablist" aria-label="Streaming phases">
              {phases.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={phase === index ? 'is-active' : ''}
                  onClick={() => setPhase(index)}
                >
                  <span>0{index + 1}</span>
                  {item === 'partial' ? 'partial JSON' : item === 'chunk' ? 'renderable chunk' : 'final artifact'}
                </button>
              ))}
            </div>
            {prompts.length ? (
              <div className="prompt-log">
                <strong>Host received</strong>
                {prompts.map((prompt, index) => (
                  <span key={`${prompt}-${index}`}>{prompt}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="artifact-shell">
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
        </section>

        <section className="feature-grid" aria-label="Core capabilities">
          <article>
            <span className="feature-index">01</span>
            <h3>Streaming-aware parsing</h3>
            <p>Extracts useful strings from incomplete tool-call JSON and renders only when the artifact is stable enough.</p>
          </article>
          <article>
            <span className="feature-index">02</span>
            <h3>Protocol included</h3>
            <p>Ships model prompt helpers, tool names, metadata builders, and a model-facing artifact authoring guide.</p>
          </article>
          <article>
            <span className="feature-index">03</span>
            <h3>Host adapters</h3>
            <p>Bring your own icons, toast, clipboard bridge, theme resolver, and follow-up prompt handler.</p>
          </article>
        </section>

        <section className="docs-grid" id="protocol">
          <article>
            <p className="eyebrow">Agent protocol</p>
            <h2>Two tools, one stable artifact boundary.</h2>
            <p>{systemPromptLine}</p>
            <CodeBlock>{`import {
  buildVisualizeSystemPrompt,
  buildVisualizeWidgetMetadata,
} from "streamviz/protocol"

const system = buildVisualizeSystemPrompt()

const metadata = buildVisualizeWidgetMetadata({
  title,
  widget_code,
  loading_messages,
})`}</CodeBlock>
          </article>
          <article id="security">
            <p className="eyebrow">Security model</p>
            <h2>Generated code stays behind a narrow iframe boundary.</h2>
            <ul className="check-list">
              <li>Sandboxed iframe runtime with CSP.</li>
              <li>Scripts execute only after final tool completion.</li>
              <li>Host communication is limited to explicit callbacks.</li>
              <li>Export and clipboard actions stay outside the generated code.</li>
            </ul>
          </article>
        </section>

        <section className="api-band">
          <div>
            <p className="eyebrow">Public API</p>
            <h2>Small surface area, production defaults.</h2>
          </div>
          <div className="api-list">
            <code>streamviz</code>
            <code>streamviz/react</code>
            <code>streamviz/core</code>
            <code>streamviz/protocol</code>
            <code>streamviz/styles.css</code>
          </div>
        </section>
      </main>
    </>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
