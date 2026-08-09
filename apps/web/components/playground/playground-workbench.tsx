'use client'

import * as stylex from '@stylexjs/stylex'
import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { ChatComposer, ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, Layout, LayoutContent, LayoutFooter, LayoutHeader, VStack } from '@astryxdesign/core/Layout'
import { StackItem } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import { Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { borderVars, colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Braces, Eraser, RadioTower } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { extractVisualizeWidgetPayload } from 'streamviz/core'
import { StreamVisualization } from 'streamviz/react'

type DebugEvent = Record<string, unknown> & { type: string }
type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>
type AgentConfig = { provider: string; model: string; configured: boolean }
type Message = { id: number; role: 'user' | 'assistant'; text: string }

const copy = {
  placeholder: 'Ask the mini agent to create a chart, diagram, calculator, dashboard, or visual explanation…',
  clear: 'Clear',
  running: 'Streaming',
  idle: 'Ready',
  notConfigured: 'Add the model key to the server before running.',
  eventsEmpty: 'Raw NDJSON events appear here as the model responds.',
  artifactEmpty: 'The iframe appears with the first widget_code fragment.',
  failed: 'Agent run failed',
} as const

const styles = stylex.create({
  pipeline: {
    gridTemplateColumns: 'minmax(0, 0.52fr) minmax(0, 0.64fr) minmax(0, 1.34fr)',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    '@media (max-width: 64rem)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
  stage: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
    '@media (max-width: 64rem)': {
      borderInlineEndWidth: spacingVars['--spacing-0'],
    },
  },
  finalStage: {
    borderInlineEndWidth: spacingVars['--spacing-0'],
  },
  summary: {
    minHeight: `calc(${spacingVars['--spacing-12']} * 2.5)`,
    flexShrink: 0,
  },
  workspace: {
    minHeight: 0,
    overflow: 'hidden',
  },
  codeBlock: {
    height: '100%',
    maxHeight: '100%',
  },
  renderWorkspace: {
    minHeight: 0,
    paddingBlockEnd: spacingVars['--spacing-4'],
  },
  composerDock: {
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 14)`,
    marginInline: 'auto',
  },
})

const isErrorEvent = (event: DebugEvent) => event.type === 'run.failed' || event.type === 'server.error'

export function PlaygroundWorkbench() {
  const { mode } = useTheme()
  const [config, setConfig] = useState<AgentConfig>({ provider: '—', model: '—', configured: false })
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [widget, setWidget] = useState<WidgetPayload | null>(null)
  const [error, setError] = useState('')
  const [isCompact, setIsCompact] = useState(false)
  const [activeStage, setActiveStage] = useState('render')
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const messageIdRef = useRef(0)
  const rawCodeBlockRef = useRef<HTMLPreElement>(null)
  const htmlCodeBlockRef = useRef<HTMLPreElement>(null)

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
    const query = window.matchMedia('(max-width: 64rem)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const rawEvents = useMemo(() => events.map(event => JSON.stringify(event)).join('\n'), [events])

  useEffect(() => {
    if (!running) return
    const node = rawCodeBlockRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [rawEvents, running])

  useEffect(() => {
    if (!running) return
    const node = htmlCodeBlockRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [running, widget?.code])

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
          setEvents(current => [...current.slice(-399), event])

          if (event.type === 'model.text.delta') {
            const delta = String(event.delta || '')
            setMessages(current => current.map(message => message.id === assistantId ? { ...message, text: message.text + delta } : message))
          } else if (event.type === 'model.tool.delta' && event.name === 'visualize_show_widget') {
            widgetArguments += String(event.delta || '')
            setWidget(extractVisualizeWidgetPayload({ raw: widgetArguments, status: 'running' }))
          } else if (event.type === 'widget.completed') {
            setWidget(extractVisualizeWidgetPayload({ metadata: event.widget, status: 'done' }))
          } else if (isErrorEvent(event)) {
            setError(String(event.message || copy.failed))
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

  const latestUser = [...messages].reverse().find(message => message.role === 'user')
  const latestAssistant = [...messages].reverse().find(message => message.role === 'assistant')
  const loadingMessage = widget?.loadingMessage || (running ? 'Waiting for visualization arguments…' : 'No active stream')
  const stageStatus = error ? 'error' : running ? 'accent' : widget?.final ? 'success' : 'neutral'
  const composer = (
    <VStack xstyle={styles.composerDock}>
      <ChatComposer
        value={prompt}
        onChange={setPrompt}
        onSubmit={value => void run(value)}
        onStop={() => abortRef.current?.abort()}
        isStopShown={running}
        isDisabled={!config.configured && !running}
        placeholder={copy.placeholder}
        density="spacious"
        footerActions={<Button label={copy.clear} variant="ghost" size="sm" icon={<Icon icon={Eraser} size="sm" />} onClick={clear} isDisabled={!prompt && !messages.length && !events.length} />}
        status={!config.configured ? { type: 'warning', message: copy.notConfigured } : error ? { type: 'error', message: error } : undefined}
      />
    </VStack>
  )

  return (
    <Layout
      height="fill"
      header={isCompact ? (
        <LayoutHeader padding={3} hasDivider>
          <TabList value={activeStage} onChange={setActiveStage} layout="fill" size="sm" aria-label="Streaming pipeline stages">
            <Tab value="stream" label="Stream" />
            <Tab value="payload" label="Parsed" />
            <Tab value="render" label="Render" />
          </TabList>
        </LayoutHeader>
      ) : undefined}
      content={(
        <LayoutContent padding={0} isScrollable={false} label="Mini agent streaming debugger" role="main">
          <Grid columns={3} gap={0} xstyle={styles.pipeline}>
              {!isCompact || activeStage === 'stream' ? (
                <VStack gap={3} padding={4} xstyle={styles.stage}>
                  <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">01 · MODEL STREAM</Text><StatusDot variant={running ? 'accent' : events.length ? 'success' : 'neutral'} label={running ? copy.running : events.length ? 'Complete' : copy.idle} isPulsing={running} /></HStack>
                  <Card padding={3} variant="muted" xstyle={styles.summary}>
                    <VStack gap={2} vAlign="between" height="100%">
                      <HStack gap={2} vAlign="center"><Icon icon={RadioTower} color="accent" size="sm" /><Text weight="bold">POST /api/agent</Text></HStack>
                      <HStack gap={2} vAlign="center"><StatusDot variant={config.configured ? 'success' : 'error'} label={config.configured ? copy.idle : copy.notConfigured} /><Text type="code" color="secondary">{config.provider} · {config.model}</Text></HStack>
                      <Text type="code" color="secondary">application/x-ndjson · {events.length} events</Text>
                    </VStack>
                  </Card>
                  <StackItem size="fill" xstyle={styles.workspace}>
                    {events.length ? <CodeBlock ref={rawCodeBlockRef} code={rawEvents} language="json" title="raw runtime stream" size="sm" width="100%" maxHeight="100%" isWrapped xstyle={styles.codeBlock} /> : <EmptyState isCompact icon={<Icon icon={RadioTower} />} title={copy.idle} description={copy.eventsEmpty} />}
                  </StackItem>
                </VStack>
              ) : null}

              {!isCompact || activeStage === 'payload' ? (
                <VStack gap={3} padding={4} xstyle={styles.stage}>
                  <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">02 · PARSED PAYLOAD</Text><StatusDot variant={stageStatus} label={widget?.final ? 'Complete' : widget ? 'Parsing' : 'Waiting'} isPulsing={Boolean(widget && !widget.final)} /></HStack>
                  <Card padding={3} variant="muted" xstyle={styles.summary}>
                    <VStack gap={2}>
                      <VStack gap={0.5}><Text type="code" color="secondary">title</Text><Text weight="bold" maxLines={1}>{widget?.title || 'Waiting for title…'}</Text></VStack>
                      <VStack gap={0.5}><Text type="code" color="secondary">loading_message</Text><Text weight="bold" maxLines={1}>{loadingMessage}</Text></VStack>
                    </VStack>
                  </Card>
                  <StackItem size="fill" xstyle={styles.workspace}>
                    {widget?.code ? <CodeBlock ref={htmlCodeBlockRef} code={widget.code} language="html" title={`widget_code · ${widget.code.length} chars`} size="sm" width="100%" maxHeight="100%" isWrapped xstyle={styles.codeBlock} /> : <EmptyState isCompact icon={<Icon icon={Braces} />} title="StreamViz parser" description="title, loading_messages, and widget_code are recovered from partial JSON." />}
                  </StackItem>
                </VStack>
              ) : null}

              {!isCompact || activeStage === 'render' ? (
                <VStack gap={3} padding={4} xstyle={[styles.stage, styles.finalStage]}>
                  <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">03 · LIVE RENDER</Text><StatusDot variant={stageStatus} label={widget?.final ? 'Rendered' : widget ? 'Updating' : 'Waiting'} isPulsing={Boolean(widget && !widget.final)} /></HStack>
                  <Card padding={3} variant="muted" xstyle={styles.summary}>
                    <VStack gap={2} vAlign="between" height="100%">
                      <VStack gap={0.5}><Text type="code" color="secondary">surface</Text><Text weight="bold">Conversation · live iframe</Text></VStack>
                      <Text type="supporting" color="secondary">The first widget_code fragment mounts the iframe; every following fragment updates it.</Text>
                    </VStack>
                  </Card>
                  <StackItem size="fill" isScrollable xstyle={styles.renderWorkspace}>
                    <VStack gap={4}>
                      {latestUser ? <ChatMessage sender="user"><ChatMessageBubble variant="filled">{latestUser.text}</ChatMessageBubble></ChatMessage> : null}
                      {latestAssistant || widget ? (
                        <ChatMessage sender="assistant">
                          <ChatMessageBubble variant="ghost" name="StreamViz">{latestAssistant?.text || loadingMessage}</ChatMessageBubble>
                          {widget ? (
                            <StreamVisualization
                              title={widget.title}
                              code={widget.code}
                              exportCode={widget.exportCode}
                              loadingMessage={widget.loadingMessage}
                              loadingMessages={widget.loadingMessages}
                              final={widget.final}
                              loadingDwellMs={0}
                              theme={{ mode }}
                              onSendPrompt={setPrompt}
                            />
                          ) : null}
                        </ChatMessage>
                      ) : <EmptyState icon={<Icon icon={Braces} />} title="Live iframe" description={copy.artifactEmpty} />}
                      {error ? <Banner status="error" title={copy.failed} description={error} /> : null}
                    </VStack>
                  </StackItem>
                </VStack>
              ) : null}
          </Grid>
        </LayoutContent>
      )}
      footer={<LayoutFooter><VStack padding={3}>{composer}</VStack></LayoutFooter>}
    />
  )
}
