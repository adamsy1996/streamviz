import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { extractVisualizeWidgetPayload } from '../../../src/core/visualizeWidgetTool'
import StreamVisualization from '../../../src/react/StreamVisualization'
import '../../../src/theme/styles.css'
import './styles.css'

type DebugEvent = Record<string, unknown> & { type: string }
type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>
type Message = { id: number; role: 'user' | 'assistant'; text: string }

const eventLabel = (event: DebugEvent) => {
  if (event.type === 'turn.started') return `Turn ${event.turn}`
  if (event.type === 'tool.started') return `Calling ${event.name}`
  if (event.type === 'tool.completed') return `Completed ${event.name}`
  if (event.type === 'widget.completed') return `Rendered ${String((event.widget as Record<string, unknown>)?.title || 'widget')}`
  if (event.type === 'run.completed') return 'Run completed'
  if (event.type === 'run.failed' || event.type === 'server.error') return String(event.message || 'Run failed')
  return event.type
}

function App() {
  const [config, setConfig] = useState({ provider: 'loading', model: 'loading' })
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [widget, setWidget] = useState<WidgetPayload | null>(null)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const messageIdRef = useRef(0)

  useEffect(() => {
    fetch('/api/config').then((response) => response.json()).then(setConfig).catch(() => {
      setConfig({ provider: 'unknown', model: 'unknown' })
    })
    return () => abortRef.current?.abort()
  }, [])

  const clear = () => {
    generationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setPrompt('')
    setMessages([])
    setEvents([])
    setWidget(null)
    setError('')
  }

  const send = async (nextPrompt = prompt) => {
    const normalized = nextPrompt.trim()
    if (!normalized || running) return
    const generation = generationRef.current + 1
    generationRef.current = generation
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setError('')
    setWidget(null)
    setEvents([])
    setPrompt('')
    const userId = ++messageIdRef.current
    const assistantId = ++messageIdRef.current
    setMessages((current) => [...current, { id: userId, role: 'user', text: normalized }, { id: assistantId, role: 'assistant', text: '' }])

    let buffer = ''
    let widgetArguments = ''
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: normalized }),
        signal: controller.signal,
      })
      if (!response.ok || !response.body) throw new Error(await response.text() || `HTTP ${response.status}`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim() || generationRef.current !== generation) continue
          const event = JSON.parse(line) as DebugEvent
          if (!['model.text.delta', 'model.tool.delta', 'model.response'].includes(event.type)) {
            setEvents((current) => [...current.slice(-39), event])
          }
          if (event.type === 'model.text.delta') {
            const delta = String(event.delta || '')
            setMessages((current) => current.map((message) => message.id === assistantId
              ? { ...message, text: message.text + delta }
              : message))
          } else if (event.type === 'model.tool.delta' && event.name === 'visualize_show_widget') {
            widgetArguments += String(event.delta || '')
            setWidget(extractVisualizeWidgetPayload({ raw: widgetArguments, status: 'running' }))
          } else if (event.type === 'widget.completed') {
            const completed = event.widget as Record<string, unknown>
            setWidget(extractVisualizeWidgetPayload({ metadata: completed, status: 'done' }))
          } else if (event.type === 'run.failed' || event.type === 'server.error') {
            setError(String(event.message || 'Agent run failed'))
          }
        }
      }
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === 'AbortError') && generationRef.current === generation) {
        setError(reason instanceof Error ? reason.message : String(reason))
      }
    } finally {
      if (generationRef.current === generation) {
        setRunning(false)
        abortRef.current = null
      }
    }
  }

  return (
    <main className="agent-shell">
      <header className="agent-header">
        <div>
          <p className="agent-kicker">Local agent runtime</p>
          <h1>StreamViz Mini Agent</h1>
          <p className="agent-provider"><span className="agent-status-dot" />{config.provider} · {config.model}</p>
        </div>
        <button className="agent-button" type="button" onClick={clear} disabled={!messages.length && !events.length && !prompt}>清空</button>
      </header>

      <section className="agent-composer" aria-label="向 Agent 提问">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void send()
          }}
          placeholder="例如：生成一张六个月营收趋势图"
          rows={3}
          disabled={running}
        />
        <div className="agent-composer-footer">
          <span>{running ? '模型正在生成，可点击清空中止' : '⌘/Ctrl + Enter 发送'}</span>
          <button className="agent-button agent-button-primary" type="button" onClick={() => void send()} disabled={running || !prompt.trim()}>
            {running ? '生成中' : '发送'}
          </button>
        </div>
      </section>

      {messages.length ? <section className="agent-conversation" aria-live="polite">
        {messages.map((message) => (
          <article className={`agent-message is-${message.role}`} key={message.id}>
            <span>{message.role === 'user' ? '你' : 'Agent'}</span>
            <p>{message.text || (running && message.role === 'assistant' ? '正在思考…' : '')}</p>
          </article>
        ))}
      </section> : null}

      {widget ? <section className="agent-artifact" aria-label="可视化结果">
        <StreamVisualization
          title={widget.title}
          code={widget.code}
          exportCode={widget.exportCode}
          loadingMessage={widget.loadingMessage}
          loadingMessages={widget.loadingMessages}
          final={widget.final}
          onSendPrompt={(value) => setPrompt(value)}
        />
      </section> : null}

      {error ? <p className="agent-error" role="alert">{error}</p> : null}

      {events.length ? <details className="agent-events" open>
        <summary>运行事件 <span>{events.length}</span></summary>
        <ol>{events.map((event, index) => <li key={`${event.type}-${index}`}><code>{event.type}</code><span>{eventLabel(event)}</span></li>)}</ol>
      </details> : null}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
