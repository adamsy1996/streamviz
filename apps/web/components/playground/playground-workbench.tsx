'use client'

import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatToolCalls,
} from '@astryxdesign/core/Chat'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, Layout, LayoutContent, LayoutHeader, VStack } from '@astryxdesign/core/Layout'
import { Markdown } from '@astryxdesign/core/Markdown'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Heading, Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { Eraser, MessageSquareText, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { extractVisualizeWidgetPayload } from 'streamviz/core'
import { StreamVisualization } from 'streamviz/react'

type DebugEvent = {
  type: string
  runId?: string
  from?: string
  payload?: Record<string, unknown>
}
type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>
type AgentConfig = { provider: string; model: string; configured: boolean }
type ConversationMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
  events?: DebugEvent[]
  widget?: WidgetPayload | null
  error?: string
  isStreaming?: boolean
  startedAt?: number
  completedAt?: number
}

const copy = {
  title: 'StreamViz Chat',
  description: 'Ask a question and watch the answer become an interactive visual experience.',
  placeholder: 'Ask for a chart, diagram, calculator, dashboard, or visual explanation…',
  clear: 'New chat',
  assistantName: 'StreamViz',
  working: 'Thinking about the best visual response…',
  failed: 'The agent could not complete this response.',
  notConfigured: 'Start the local Mastra agent service before starting a conversation.',
  emptyTitle: 'What would you like to understand?',
  emptyDescription: 'StreamViz turns model responses into live, interactive visualizations inside the conversation.',
  toolTarget: 'Streaming visualization',
  toolDetail: 'Mastra event stream',
} as const

const suggestions = [
  'Build an interactive calculator comparing two investment plans.',
  'Explain the urban water cycle as a visual illustration.',
  'Compare three AI models by latency, quality, and cost.',
] as const

const isErrorEvent = (event: DebugEvent) => event.type === 'error' || event.type === 'tool-error'
const hasToolActivity = (message: ConversationMessage) => Boolean(
  message.widget || message.events?.some(event => event.type.startsWith('tool-')),
)

const getEventError = (event: DebugEvent) => {
  const payload = event.payload || {}
  const value = payload.error || payload.message
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  return value ? JSON.stringify(value) : copy.failed
}

const summarizeToolEvent = (event: DebugEvent): DebugEvent | null => {
  if (!event.type.startsWith('tool-') && !isErrorEvent(event)) return null
  const payload = { ...(event.payload || {}) }

  if (typeof payload.argsTextDelta === 'string') {
    payload.argsTextDelta = `[${payload.argsTextDelta.length} character argument delta]`
  }

  const summarizeValue = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(summarizeValue)
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
      if ((key === 'widget_code' || key === 'guide') && typeof entry === 'string') {
        return [key, `[${entry.length} characters]`]
      }
      return [key, summarizeValue(entry)]
    }))
  }

  if ('args' in payload) payload.args = summarizeValue(payload.args)
  if ('result' in payload) payload.result = summarizeValue(payload.result)
  return { ...event, payload }
}

const getLatestToolEvent = (message: ConversationMessage) => {
  for (let index = (message.events?.length || 0) - 1; index >= 0; index -= 1) {
    const event = message.events?.[index]
    if (event?.type.startsWith('tool-')) return event
  }
  return undefined
}

const getLatestToolName = (message: ConversationMessage) => {
  for (let index = (message.events?.length || 0) - 1; index >= 0; index -= 1) {
    const toolName = message.events?.[index]?.payload?.toolName
    if (typeof toolName === 'string') return toolName
  }
  return message.widget ? 'visualize_show_widget' : 'tool'
}

export function PlaygroundWorkbench() {
  const { mode } = useTheme()
  const [config, setConfig] = useState<AgentConfig>({ provider: '—', model: '—', configured: false })
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const messageIdRef = useRef(0)
  const threadIdRef = useRef<string | null>(null)

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

  const clear = () => {
    generationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setPrompt('')
    setMessages([])
    threadIdRef.current = null
  }

  const run = async (value = prompt) => {
    const normalized = value.trim()
    if (!normalized || running) return

    const generation = generationRef.current + 1
    generationRef.current = generation
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setPrompt('')

    const userId = ++messageIdRef.current
    const assistantId = ++messageIdRef.current
    const threadId = threadIdRef.current || crypto.randomUUID()
    threadIdRef.current = threadId
    const startedAt = Date.now()
    setMessages(current => [
      ...current,
      { id: userId, role: 'user', text: normalized },
      { id: assistantId, role: 'assistant', text: '', events: [], widget: null, isStreaming: true, startedAt },
    ])

    let buffer = ''
    let widgetArguments = ''
    let widgetToolCallId = ''
    try {
      const response = await fetch('/api/agent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: normalized, threadId }),
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
        buffer += decoder.decode(chunk.value, { stream: true }).replaceAll('\r\n', '\n')
        const frames = buffer.split('\n\n')
        buffer = frames.pop() || ''
        for (const frame of frames) {
          if (generationRef.current !== generation) continue
          const data = frame
            .split('\n')
            .filter(line => line.startsWith('data:'))
            .map(line => line.slice(5).trimStart())
            .join('\n')
          if (!data || data === '[DONE]') continue

          const event = JSON.parse(data) as DebugEvent
          const payload = event.payload || {}
          let textDelta = ''
          let nextWidget: WidgetPayload | undefined
          let eventError = ''

          if (event.type === 'text-delta') {
            textDelta = String(payload.text || '')
          } else if (event.type === 'tool-call-input-streaming-start' && payload.toolName === 'visualize_show_widget') {
            widgetToolCallId = String(payload.toolCallId || '')
            widgetArguments = ''
          } else if (event.type === 'tool-call-delta' && String(payload.toolCallId || '') === widgetToolCallId) {
            widgetArguments += String(payload.argsTextDelta || '')
            nextWidget = extractVisualizeWidgetPayload({ raw: widgetArguments, status: 'running' })
          } else if (event.type === 'tool-call' && payload.toolName === 'visualize_show_widget') {
            widgetToolCallId = String(payload.toolCallId || widgetToolCallId)
            if (payload.args && typeof payload.args === 'object') {
              widgetArguments = JSON.stringify(payload.args)
              nextWidget = extractVisualizeWidgetPayload({ raw: widgetArguments, status: 'running' })
            }
          } else if (event.type === 'tool-result' && payload.toolName === 'visualize_show_widget') {
            const result = payload.result && typeof payload.result === 'object'
              ? payload.result as Record<string, unknown>
              : {}
            const artifact = result.artifact && typeof result.artifact === 'object' ? result.artifact : result
            nextWidget = extractVisualizeWidgetPayload({ metadata: artifact, status: 'done' })
            if (payload.isError) eventError = getEventError(event)
          } else if (isErrorEvent(event)) {
            eventError = getEventError(event)
          }

          const debugEvent = summarizeToolEvent(event)
          setMessages(current => current.map(message => message.id === assistantId ? {
            ...message,
            text: message.text + textDelta,
            events: debugEvent
              ? [...(message.events || []).slice(-199), debugEvent]
              : message.events,
            widget: nextWidget || message.widget,
            error: eventError || message.error,
          } : message))
        }
      }
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === 'AbortError') && generationRef.current === generation) {
        const message = reason instanceof Error ? reason.message : String(reason)
        setMessages(current => current.map(item => item.id === assistantId ? { ...item, error: message } : item))
      }
    } finally {
      if (generationRef.current === generation) {
        setMessages(current => current.map(message => message.id === assistantId ? {
          ...message,
          text: message.text || (message.widget ? 'Here is the interactive visualization.' : ''),
          isStreaming: false,
          completedAt: Date.now(),
        } : message))
        setRunning(false)
        abortRef.current = null
      }
    }
  }

  const composer = (
    <ChatComposer
      value={prompt}
      onChange={setPrompt}
      onSubmit={value => void run(value)}
      onStop={() => abortRef.current?.abort()}
      isStopShown={running}
      isDisabled={!config.configured && !running}
      placeholder={copy.placeholder}
      density="spacious"
      footerActions={<Text type="supporting" color="secondary">AI can make mistakes. Verify important results.</Text>}
      status={!config.configured ? { type: 'warning', message: copy.notConfigured } : undefined}
    />
  )

  const emptyState = (
    <EmptyState
      icon={<Icon icon={Sparkles} />}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
      headingLevel={2}
      actions={
        <HStack gap={2} wrap="wrap" hAlign="center">
          {suggestions.map(suggestion => (
            <Button key={suggestion} label={suggestion} variant="secondary" size="sm" onClick={() => void run(suggestion)} isDisabled={!config.configured || running} />
          ))}
        </HStack>
      }
    />
  )

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader padding={3} hasDivider>
          <HStack hAlign="between" vAlign="center" gap={4} wrap="wrap">
            <VStack gap={0.5}>
              <Heading level={1}>{copy.title}</Heading>
              <Text type="supporting" color="secondary">{copy.description}</Text>
            </VStack>
            <HStack gap={3} vAlign="center">
              <HStack gap={1.5} vAlign="center">
                <StatusDot variant={config.configured ? 'success' : 'error'} label={config.configured ? 'Ready' : copy.notConfigured} isPulsing={running} />
                <Text type="code" color="secondary">{config.provider} · {config.model}</Text>
              </HStack>
              <Button label={copy.clear} variant="ghost" size="sm" icon={<Icon icon={Eraser} size="sm" />} onClick={clear} isDisabled={!messages.length && !prompt} />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} label="StreamViz conversation" role="main">
          <ChatLayout density="spacious" composer={composer} emptyState={emptyState}>
            {messages.length ? (
              <ChatMessageList density="spacious" isStreaming={running}>
                {messages.map(message => {
                  const toolActive = message.role === 'assistant' && hasToolActivity(message)
                  const latestToolEvent = getLatestToolEvent(message)
                  const toolName = getLatestToolName(message)
                  const rawEvents = message.events?.map(event => JSON.stringify(event)).join('\n') || ''
                  const duration = message.startedAt && message.completedAt
                    ? `${((message.completedAt - message.startedAt) / 1000).toFixed(1)}s`
                    : undefined
                  const toolCompleted = message.widget?.final || latestToolEvent?.type === 'tool-result'
                  const toolStatus = message.error ? 'error' : toolCompleted ? 'complete' : toolActive ? 'running' : 'pending'

                  return (
                    <ChatMessage
                      key={message.id}
                      sender={message.role}
                      metadata={message.role === 'assistant' && !message.isStreaming ? (
                        <ChatMessageMetadata footer={<Text type="supporting" color="secondary">{config.model}</Text>} />
                      ) : undefined}
                    >
                      <ChatMessageBubble variant={message.role === 'assistant' ? 'ghost' : 'filled'} name={message.role === 'assistant' ? copy.assistantName : undefined}>
                        {message.role === 'assistant' ? (
                          message.text
                            ? <Markdown density="compact" headingLevelStart={3} isStreaming={message.isStreaming}>{message.text}</Markdown>
                            : <HStack gap={2} vAlign="center"><StatusDot variant="accent" label={copy.working} isPulsing /><Text color="secondary">{message.widget?.loadingMessage || copy.working}</Text></HStack>
                        ) : message.text}
                      </ChatMessageBubble>

                      {toolActive ? (
                        <ChatToolCalls calls={[{
                          key: `visualize-${message.id}`,
                          name: toolName,
                          status: toolStatus,
                          target: message.widget?.title || (toolName === 'visualize_read_me' ? 'Visualization rules' : copy.toolTarget),
                          additions: message.widget?.code.length,
                          duration: toolStatus === 'complete' ? duration : undefined,
                          errorMessage: message.error,
                          resultDetail: rawEvents ? (
                            <VStack gap={2}>
                              <Text type="supporting" color="secondary">{copy.toolDetail}</Text>
                              <CodeBlock code={rawEvents} language="json" size="sm" width="100%" maxHeight={360} isWrapped container="section" />
                            </VStack>
                          ) : undefined,
                        }]} />
                      ) : null}

                      {message.widget ? (
                        <StreamVisualization
                          title={message.widget.title}
                          code={message.widget.code}
                          exportCode={message.widget.exportCode}
                          loadingMessage={message.widget.loadingMessage}
                          loadingMessages={message.widget.loadingMessages}
                          final={message.widget.final}
                          theme={{ mode }}
                          onSendPrompt={setPrompt}
                        />
                      ) : null}

                      {message.error ? <Banner status="error" title={copy.failed} description={message.error} /> : null}
                    </ChatMessage>
                  )
                })}
              </ChatMessageList>
            ) : null}
          </ChatLayout>
        </LayoutContent>
      }
    />
  )
}
