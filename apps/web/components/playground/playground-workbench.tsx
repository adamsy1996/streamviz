'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTheme } from 'next-themes'
import {
  Activity,
  AlertCircle,
  Bot,
  Braces,
  CheckCircle2,
  CircleStop,
  Eraser,
  LoaderCircle,
  Send,
  TerminalSquare,
} from 'lucide-react'
import { extractVisualizeWidgetPayload } from 'streamviz/core'
import { StreamVisualization } from 'streamviz/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Locale } from '@/lib/site'

type DebugEvent = Record<string, unknown> & { type: string }
type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>
type AgentConfig = { provider: string; model: string; configured: boolean }
type Message = { id: number; role: 'user' | 'assistant'; text: string }

const copy = {
  en: {
    eyebrow: 'Server-side mini agent', title: 'Debug the complete StreamViz loop.',
    description: 'Send a real prompt, inspect every runtime event, and watch the parsed widget render while model arguments are still streaming.',
    placeholder: 'Create an architecture diagram for an agent that calls tools and streams a visual result…',
    send: 'Run agent', stop: 'Stop', clear: 'Clear', running: 'Running', idle: 'Ready', notConfigured: 'Server key not configured',
    events: 'Runtime events', eventsEmpty: 'Run the agent to inspect its event stream.', artifact: 'Live artifact', artifactEmpty: 'The visualization will appear here when the model calls visualize_show_widget.',
    conversation: 'Agent conversation', shortcut: '⌘/Ctrl + Enter to run', serverBoundary: 'Key stays on the server', parsed: 'Parsed widget', streaming: 'Streaming arguments', complete: 'Complete',
  },
  zh: {
    eyebrow: '服务端 Mini Agent', title: '调试完整的 StreamViz 链路。',
    description: '发送真实 Prompt，检查每一个 Runtime 事件，并在模型参数仍在流式输出时观察解析后的 Widget 实时渲染。',
    placeholder: '生成一张 Agent 调用工具并流式输出可视化结果的架构图……',
    send: '运行 Agent', stop: '停止', clear: '清空', running: '运行中', idle: '就绪', notConfigured: '服务端尚未配置 Key',
    events: 'Runtime 事件', eventsEmpty: '运行 Agent 后，可以在这里检查完整事件流。', artifact: '实时产物', artifactEmpty: '模型调用 visualize_show_widget 后，可视化会在这里实时出现。',
    conversation: 'Agent 对话', shortcut: '⌘/Ctrl + Enter 运行', serverBoundary: 'Key 仅保留在服务端', parsed: '已解析 Widget', streaming: '参数流式追加中', complete: '已完成',
  },
} as const

const eventSummary = (event: DebugEvent) => {
  if (event.type === 'run.started') return String(event.prompt || '')
  if (event.type === 'turn.started') return `turn ${String(event.turn || '')}`
  if (event.type === 'model.text.delta') return String(event.delta || '')
  if (event.type === 'model.tool.delta') return `${String(event.name || 'tool')} · +${String(event.delta || '').length} chars`
  if (event.type === 'model.response') return String(event.responseId || '')
  if (event.type === 'tool.started') return String(event.name || '')
  if (event.type === 'tool.completed') return String(event.name || '')
  if (event.type === 'widget.completed') return String((event.widget as Record<string, unknown> | undefined)?.title || 'visualize widget')
  if (event.type === 'run.completed') return `${String(event.turns || '')} turns`
  if (event.type === 'run.failed' || event.type === 'server.error') return String(event.message || 'Agent run failed')
  return JSON.stringify(event)
}

const isErrorEvent = (event: DebugEvent) => event.type === 'run.failed' || event.type === 'server.error'

export function PlaygroundWorkbench({ locale = 'en' }: { locale?: Locale }) {
  const t = copy[locale]
  const { resolvedTheme } = useTheme()
  const [config, setConfig] = useState<AgentConfig>({ provider: '—', model: '—', configured: false })
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [widget, setWidget] = useState<WidgetPayload | null>(null)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const messageIdRef = useRef(0)
  const eventListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/agent/config/', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<AgentConfig>
      })
      .then(setConfig)
      .catch(() => setConfig({ provider: 'unknown', model: 'unknown', configured: false }))
    return () => abortRef.current?.abort()
  }, [])

  useEffect(() => {
    const node = eventListRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [events])

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

  const stop = () => abortRef.current?.abort()

  const run = async () => {
    const normalized = prompt.trim()
    if (!normalized || running) return

    const generation = generationRef.current + 1
    generationRef.current = generation
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setError('')
    setEvents([])
    setWidget(null)
    setPrompt('')

    const userId = ++messageIdRef.current
    const assistantId = ++messageIdRef.current
    setMessages((current) => [...current, { id: userId, role: 'user', text: normalized }, { id: assistantId, role: 'assistant', text: '' }])

    let buffer = ''
    let widgetArguments = ''
    try {
      const response = await fetch('/api/agent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: normalized }),
        signal: controller.signal,
      })
      if (!response.ok || !response.body) {
        const failure = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
        throw new Error(failure.error || `HTTP ${response.status}`)
      }

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
          setEvents((current) => [...current.slice(-199), event])

          if (event.type === 'model.text.delta') {
            const delta = String(event.delta || '')
            setMessages((current) => current.map((message) => message.id === assistantId
              ? { ...message, text: message.text + delta }
              : message))
          } else if (event.type === 'model.tool.delta' && event.name === 'visualize_show_widget') {
            widgetArguments += String(event.delta || '')
            setWidget(extractVisualizeWidgetPayload({ raw: widgetArguments, status: 'running' }))
          } else if (event.type === 'widget.completed') {
            setWidget(extractVisualizeWidgetPayload({ metadata: event.widget, status: 'done' }))
          } else if (isErrorEvent(event)) {
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

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void run()
  }

  return (
    <main className="min-h-[calc(100vh-var(--sv-header-height))] bg-background pb-10">
      <section className="page-shell border-b py-10 lg:flex lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-3xl">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{t.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{t.description}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 lg:mt-0">
          <span className="inline-flex h-8 items-center gap-2 rounded-md border bg-card px-3 font-mono text-[10px]"><i className={`size-1.5 rounded-full ${config.configured ? 'bg-success' : 'bg-destructive'}`} />{config.provider} · {config.model}</span>
          <span className="inline-flex h-8 items-center gap-2 rounded-md border bg-card px-3 text-[10px] text-muted-foreground"><CheckCircle2 className="size-3 text-success" />{t.serverBoundary}</span>
        </div>
      </section>

      <section className="page-shell py-5">
        <form onSubmit={submit} className="rounded-xl border bg-card p-3 shadow-surface-sm">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                void run()
              }
            }}
            placeholder={t.placeholder}
            className="min-h-24 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
            disabled={running}
          />
          <div className="flex items-center justify-between gap-3 border-t px-2 pt-3">
            <span className="text-[10px] text-muted-foreground">{config.configured ? t.shortcut : t.notConfigured}</span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!prompt && !messages.length && !events.length}><Eraser />{t.clear}</Button>
              {running ? <Button type="button" variant="outline" size="sm" onClick={stop}><CircleStop />{t.stop}</Button> : null}
              <Button type="submit" size="sm" disabled={running || !prompt.trim() || !config.configured}>{running ? <LoaderCircle className="animate-spin" /> : <Send />}{running ? t.running : t.send}</Button>
            </div>
          </div>
        </form>
      </section>

      <section className="page-shell grid gap-4 xl:grid-cols-[minmax(340px,.76fr)_minmax(560px,1.24fr)]">
        <div className="grid min-h-[640px] grid-rows-[44px_minmax(0,1fr)_40px] overflow-hidden rounded-xl border bg-card">
          <header className="flex items-center gap-2 border-b px-4"><TerminalSquare className="size-4 text-primary" /><strong className="text-xs font-medium">{t.events}</strong><span className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">NDJSON · {events.length}</span></header>
          <div ref={eventListRef} className="overflow-y-auto bg-[var(--slate-1)] p-2 font-mono text-[10px] leading-5">
            {events.length ? events.map((event, index) => (
              <div key={`${event.type}-${index}`} className="grid grid-cols-[22px_minmax(0,1fr)] gap-2 border-b border-border/70 px-2 py-2 last:border-0">
                <span className="text-right text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0"><strong className={isErrorEvent(event) ? 'font-medium text-destructive' : 'font-medium text-primary'}>{event.type}</strong><p className="mt-0.5 whitespace-pre-wrap break-words text-muted-foreground">{eventSummary(event)}</p></div>
              </div>
            )) : <div className="grid h-full place-items-center px-8 text-center text-muted-foreground"><div><Activity className="mx-auto mb-3 size-5" /><p>{t.eventsEmpty}</p></div></div>}
          </div>
          <footer className="flex items-center gap-2 border-t px-4 text-[10px] text-muted-foreground"><i className={`size-1.5 rounded-full ${running ? 'animate-pulse bg-primary' : 'bg-success'}`} />{running ? t.running : t.idle}<span className="ml-auto font-mono">application/x-ndjson</span></footer>
        </div>

        <div className="grid min-h-[640px] grid-rows-[44px_minmax(0,1fr)_40px] overflow-hidden rounded-xl border bg-card">
          <header className="flex items-center gap-2 border-b px-4"><Braces className="size-4 text-primary" /><strong className="text-xs font-medium">{t.artifact}</strong>{widget ? <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">{widget.final ? t.complete : t.streaming}</span> : null}<span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><i className={`size-1.5 rounded-full ${running ? 'animate-pulse bg-primary' : 'bg-success'}`} />{t.parsed}</span></header>
          <div className="min-h-0 overflow-y-auto bg-[var(--slate-1)] p-3 sm:p-5">
            {messages.length ? <div className="mb-4 space-y-3" aria-label={t.conversation}>{messages.map((message) => <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : ''}`}>{message.role === 'assistant' ? <span className="grid size-7 shrink-0 place-items-center rounded-full border bg-card"><Bot className="size-3.5 text-primary" /></span> : null}<p className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-5 ${message.role === 'user' ? 'bg-muted text-foreground' : 'border bg-card text-muted-foreground'}`}>{message.text || (running && message.role === 'assistant' ? '…' : '')}</p></div>)}</div> : null}
            {widget ? <StreamVisualization
              title={widget.title}
              code={widget.code}
              exportCode={widget.exportCode}
              loadingMessage={widget.loadingMessage}
              loadingMessages={widget.loadingMessages}
              final={widget.final}
              theme={{ mode: resolvedTheme === 'dark' ? 'dark' : 'light' }}
              onSendPrompt={(value) => setPrompt(value)}
            /> : <div className="grid min-h-[430px] place-items-center rounded-xl border border-dashed bg-card/40 px-10 text-center text-muted-foreground"><div><Bot className="mx-auto mb-4 size-7" /><p className="max-w-sm text-xs leading-5">{t.artifactEmpty}</p></div></div>}
            {error ? <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div> : null}
          </div>
          <footer className="flex items-center justify-between border-t px-4 text-[10px] text-muted-foreground"><span>visualize_read_me → visualize_show_widget</span><span className="font-mono">{widget?.code.length || 0} chars</span></footer>
        </div>
      </section>
    </main>
  )
}
