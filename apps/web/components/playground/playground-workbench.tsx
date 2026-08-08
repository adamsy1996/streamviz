'use client'

import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { ChatComposer, ChatLayout, ChatMessage, ChatMessageBubble, ChatMessageList, ChatToolCalls } from '@astryxdesign/core/Chat'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, Layout, LayoutContent, LayoutHeader, LayoutPanel, VStack } from '@astryxdesign/core/Layout'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import { Heading, Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { Braces, CheckCircle2, Eraser, MessageSquareText, RadioTower } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { extractVisualizeWidgetPayload } from 'streamviz/core'
import { StreamVisualization } from 'streamviz/react'
import type { Locale } from '@/lib/site'

type DebugEvent = Record<string, unknown> & { type: string }
type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>
type AgentConfig = { provider: string; model: string; configured: boolean }
type Message = { id: number; role: 'user' | 'assistant'; text: string }

const copy = {
  en: {
    title: 'Mini Agent Debugger', description: 'Inspect the model stream, parsed tool call, and live artifact in one server-backed loop.',
    placeholder: 'Create an architecture diagram for an agent that calls tools and streams a visual result…', clear: 'Clear',
    running: 'Running', idle: 'Ready', notConfigured: 'Add the model key to the server before running.', events: 'Raw runtime stream',
    eventsEmpty: 'Send a prompt to inspect the NDJSON event stream.', artifact: 'Live artifact', artifactEmpty: 'The visualization appears here as visualize_show_widget arguments arrive.',
    conversationEmpty: 'Ask the mini agent to generate a visualization.', serverBoundary: 'API key stays on the server', parsed: 'StreamViz parser', streaming: 'Streaming', complete: 'Complete',
    toolTarget: 'HTML widget arguments', assistantName: 'StreamViz Agent', failed: 'Agent run failed',
  },
  zh: {
    title: 'Mini Agent 调试器', description: '在一条服务端链路中同步检查模型原始流、解析后的 Tool Call 和实时产物。',
    placeholder: '生成一张 Agent 调用工具并流式输出可视化结果的架构图……', clear: '清空',
    running: '运行中', idle: '就绪', notConfigured: '请先在服务端配置模型 Key。', events: '原始 Runtime 流',
    eventsEmpty: '发送 Prompt 后，可以在这里检查 NDJSON 事件流。', artifact: '实时产物', artifactEmpty: 'visualize_show_widget 参数到达后，可视化会在这里增量出现。',
    conversationEmpty: '让 Mini Agent 生成一个可视化。', serverBoundary: 'API Key 仅保留在服务端', parsed: 'StreamViz 解析器', streaming: '流式追加中', complete: '已完成',
    toolTarget: 'HTML Widget 参数', assistantName: 'StreamViz Agent', failed: 'Agent 运行失败',
  },
} as const

const isErrorEvent = (event: DebugEvent) => event.type === 'run.failed' || event.type === 'server.error'

export function PlaygroundWorkbench({ locale = 'en' }: { locale?: Locale }) {
  const t = copy[locale]
  const { mode } = useTheme()
  const [config, setConfig] = useState<AgentConfig>({ provider: '—', model: '—', configured: false })
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [widget, setWidget] = useState<WidgetPayload | null>(null)
  const [error, setError] = useState('')
  const [isCompact, setIsCompact] = useState(false)
  const [activePanel, setActivePanel] = useState('chat')
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const messageIdRef = useRef(0)

  useEffect(() => {
    fetch('/api/agent/config/', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<AgentConfig>
      })
      .then(setConfig)
      .catch(() => setConfig({ provider: 'unknown', model: 'unknown', configured: false }))
    return () => abortRef.current?.abort()
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
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

  const run = async (value = prompt) => {
    const normalized = value.trim()
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
    setMessages(current => [...current, { id: userId, role: 'user', text: normalized }, { id: assistantId, role: 'assistant', text: '' }])

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
          setEvents(current => [...current.slice(-199), event])

          if (event.type === 'model.text.delta') {
            const delta = String(event.delta || '')
            setMessages(current => current.map(message => message.id === assistantId ? { ...message, text: message.text + delta } : message))
          } else if (event.type === 'model.tool.delta' && event.name === 'visualize_show_widget') {
            widgetArguments += String(event.delta || '')
            setWidget(extractVisualizeWidgetPayload({ raw: widgetArguments, status: 'running' }))
          } else if (event.type === 'widget.completed') {
            setWidget(extractVisualizeWidgetPayload({ metadata: event.widget, status: 'done' }))
          } else if (isErrorEvent(event)) {
            setError(String(event.message || t.failed))
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

  const rawEvents = useMemo(() => events.map(event => JSON.stringify(event)).join('\n'), [events])
  const hasToolActivity = events.some(event => event.type === 'tool.started' || event.type === 'model.tool.delta' || event.type === 'widget.completed')
  const toolStatus = error ? 'error' : widget?.final ? 'complete' : hasToolActivity ? 'running' : 'pending'
  const composer = (
    <ChatComposer
      value={prompt}
      onChange={setPrompt}
      onSubmit={value => void run(value)}
      onStop={() => abortRef.current?.abort()}
      isStopShown={running}
      isDisabled={!config.configured && !running}
      placeholder={t.placeholder}
      density="balanced"
      footerActions={<Button label={t.clear} variant="ghost" size="sm" icon={<Icon icon={Eraser} size="sm" />} onClick={clear} isDisabled={!prompt && !messages.length && !events.length} />}
      status={!config.configured ? { type: 'warning', message: t.notConfigured } : error ? { type: 'error', message: error } : undefined}
    />
  )

  const rawPanel = (
    <VStack gap={3} height="100%">
      <HStack hAlign="between" vAlign="center"><HStack gap={2} vAlign="center"><Icon icon={RadioTower} size="sm" color="accent" /><Text weight="bold">{t.events}</Text></HStack><Text type="code" color="secondary">NDJSON · {events.length}</Text></HStack>
      {events.length
        ? <CodeBlock code={rawEvents} language="json" size="sm" width="100%" maxHeight="100%" isWrapped container="section" />
        : <EmptyState isCompact icon={<Icon icon={RadioTower} />} title={t.idle} description={t.eventsEmpty} />}
      <HStack hAlign="between" vAlign="center"><StatusDot variant={running ? 'accent' : 'success'} label={running ? t.running : t.idle} isPulsing={running} /><Text type="code" color="secondary">application/x-ndjson</Text></HStack>
    </VStack>
  )
  const conversationPanel = (
    <ChatLayout
      density="balanced"
      composer={composer}
      emptyState={<EmptyState icon={<Icon icon={MessageSquareText} />} title={t.conversationEmpty} description={t.description} />}
    >
      <ChatMessageList density="balanced" isStreaming={running}>
        {messages.map(message => (
          <ChatMessage key={message.id} sender={message.role}>
            <ChatMessageBubble variant={message.role === 'assistant' ? 'ghost' : 'filled'} name={message.role === 'assistant' ? t.assistantName : undefined}>
              {message.text || (running && message.role === 'assistant' ? '…' : '')}
            </ChatMessageBubble>
            {message.role === 'assistant' && hasToolActivity ? (
              <ChatToolCalls calls={[{
                name: 'visualize_show_widget',
                status: toolStatus,
                target: widget?.title || t.toolTarget,
                additions: widget?.code.length,
                errorMessage: error || undefined,
              }]} />
            ) : null}
          </ChatMessage>
        ))}
      </ChatMessageList>
    </ChatLayout>
  )
  const artifactPanel = (
    <VStack gap={3} height="100%">
      <HStack hAlign="between" vAlign="center"><HStack gap={2} vAlign="center"><Icon icon={Braces} size="sm" color="accent" /><Text weight="bold">{t.artifact}</Text></HStack><HStack gap={2} vAlign="center"><StatusDot variant={widget?.final ? 'success' : widget ? 'accent' : 'neutral'} label={widget?.final ? t.complete : widget ? t.streaming : t.parsed} isPulsing={Boolean(widget && !widget.final)} /><Text type="supporting" color="secondary">{widget?.final ? t.complete : widget ? t.streaming : t.parsed}</Text></HStack></HStack>
      {widget ? (
        <StreamVisualization
          title={widget.title}
          code={widget.code}
          exportCode={widget.exportCode}
          loadingMessage={widget.loadingMessage}
          loadingMessages={widget.loadingMessages}
          final={widget.final}
          theme={{ mode }}
          onSendPrompt={setPrompt}
        />
      ) : <EmptyState icon={<Icon icon={Braces} />} title={t.artifact} description={t.artifactEmpty} />}
      {error ? <Banner status="error" title={t.failed} description={error} /> : null}
      <HStack hAlign="between"><Text type="code" color="secondary">visualize_read_me → visualize_show_widget</Text><Text type="code" color="secondary">{widget?.code.length || 0} chars</Text></HStack>
    </VStack>
  )

  if (isCompact) {
    return (
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={3} hasDivider>
            <VStack gap={3} width="100%">
              <VStack gap={0.5}><Heading level={1}>{t.title}</Heading><Text type="supporting" color="secondary" maxLines={1}>{t.description}</Text></VStack>
              <TabList value={activePanel} onChange={setActivePanel} layout="fill" size="sm" aria-label={locale === 'zh' ? '调试面板' : 'Debugger panels'}>
                <Tab value="stream" label={locale === 'zh' ? '原始流' : 'Stream'} />
                <Tab value="chat" label={locale === 'zh' ? '对话' : 'Chat'} />
                <Tab value="artifact" label={locale === 'zh' ? '产物' : 'Artifact'} />
              </TabList>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={activePanel === 'chat' ? 0 : 3} label={locale === 'zh' ? '调试面板内容' : 'Debugger panel'} role="main">
            {activePanel === 'stream' ? rawPanel : activePanel === 'artifact' ? artifactPanel : conversationPanel}
          </LayoutContent>
        }
      />
    )
  }

  return (
    <Layout
      height="fill"
      defaultHasDividers
      header={
        <LayoutHeader padding={3}>
          <HStack hAlign="between" vAlign="center" gap={4}>
            <VStack gap={0.5}>
              <Heading level={1}>{t.title}</Heading>
              <Text type="supporting" color="secondary" maxLines={1}>{t.description}</Text>
            </VStack>
            <HStack gap={3} vAlign="center">
              <HStack gap={1.5} vAlign="center"><Icon icon={CheckCircle2} size="sm" color="success" /><Text type="supporting" color="secondary">{t.serverBoundary}</Text></HStack>
              <Card padding={2} variant="muted"><HStack gap={2} vAlign="center"><StatusDot variant={config.configured ? 'success' : 'error'} label={config.configured ? t.idle : t.notConfigured} isPulsing={running} /><Text type="code">{config.provider} · {config.model}</Text></HStack></Card>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      start={
        <LayoutPanel width={380} padding={3} hasDivider label={t.events} role="complementary">
          {rawPanel}
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={0} label={locale === 'zh' ? 'Agent 对话' : 'Agent conversation'} role="main">
          {conversationPanel}
        </LayoutContent>
      }
      end={
        <LayoutPanel width={620} padding={3} hasDivider label={t.artifact} role="complementary">
          {artifactPanel}
        </LayoutPanel>
      }
    />
  )
}
