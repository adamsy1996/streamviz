'use client'

import * as stylex from '@stylexjs/stylex'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, Layout, LayoutContent, LayoutHeader, VStack } from '@astryxdesign/core/Layout'
import { Selector } from '@astryxdesign/core/Selector'
import { StackItem } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import { Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { borderVars, colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Braces, Play, RadioTower } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { extractVisualizeWidgetPayload } from 'streamviz/core'
import { StreamVisualization } from 'streamviz/react'
import { homeDemoCases, type HomeDemoCase } from '@/lib/home-demo-cases'

type DebugEvent = Record<string, unknown> & { type: string }
type WidgetPayload = ReturnType<typeof extractVisualizeWidgetPayload>

const playgroundCases = homeDemoCases.filter(demoCase => demoCase.id !== 'agent-sequence')
const progressSteps = [3, 7, 12, 18, 26, 36, 48, 61, 74, 86, 94, 100]
const replayDelaysMs = [350, 700, 1100, 1500, 1950, 2400, 2900, 3400, 3900, 4400, 4900, 5500]

const copy = {
  running: 'Streaming',
  idle: 'Ready',
  eventsEmpty: 'Replay an example to inspect its deterministic event stream.',
  artifactEmpty: 'The iframe appears with the first widget_code fragment.',
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
  controls: {
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 10)`,
  },
})

const createDeltaEvent = (demoCase: HomeDemoCase, progress: number, delta: string): DebugEvent => ({
  type: 'tool.input.delta',
  tool: 'visualize_show_widget',
  example: demoCase.id,
  progress,
  delta,
})

const scrollCodeBlockToEnd = (root: HTMLPreElement | null) => {
  const scrollContainer = root?.querySelector<HTMLElement>('[role="group"]')
  if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight
}

export function PlaygroundWorkbench() {
  const { mode } = useTheme()
  const [selectedId, setSelectedId] = useState(playgroundCases[0].id)
  const [running, setRunning] = useState(false)
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [widget, setWidget] = useState<WidgetPayload | null>(null)
  const [isCompact, setIsCompact] = useState(false)
  const [activeStage, setActiveStage] = useState('render')
  const runIdRef = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const rawCodeBlockRef = useRef<HTMLPreElement>(null)
  const htmlCodeBlockRef = useRef<HTMLPreElement>(null)
  const selectedCase = playgroundCases.find(demoCase => demoCase.id === selectedId) || playgroundCases[0]

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current = []
  }, [])

  const replay = useCallback((demoCase: HomeDemoCase) => {
    clearTimers()
    const runId = runIdRef.current + 1
    runIdRef.current = runId
    setRunning(true)
    setEvents([{
      type: 'stream.opened',
      source: 'local-preset',
      protocol: 'StreamViz visualize_show_widget',
      example: demoCase.id,
    }])
    setWidget(null)

    let previousLength = 0
    progressSteps.forEach((progress, index) => {
      const timer = setTimeout(() => {
        if (runIdRef.current !== runId) return
        const code = demoCase.codeAtProgress(progress)
        const delta = code.slice(previousLength)
        previousLength = code.length
        const final = progress === 100

        setEvents(current => [
          ...current,
          createDeltaEvent(demoCase, progress, delta),
          ...(final ? [{
            type: 'tool.result',
            tool: 'visualize_show_widget',
            title: demoCase.title,
            widget_code_chars: demoCase.code.length,
          }] : []),
        ])
        setWidget(extractVisualizeWidgetPayload(final ? {
          status: 'done',
          metadata: {
            title: demoCase.title,
            widget_code: demoCase.code,
            loading_messages: [...demoCase.loadingMessages],
          },
        } : {
          status: 'running',
          arguments: {
            title: demoCase.title,
            widget_code: code,
            loading_messages: [...demoCase.loadingMessages],
          },
        }))
        if (final) setRunning(false)
      }, replayDelaysMs[index])
      timersRef.current.push(timer)
    })
  }, [clearTimers])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 64rem)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    replay(selectedCase)
    return clearTimers
  }, [clearTimers, replay, selectedCase])

  const rawEvents = useMemo(() => events.map(event => JSON.stringify(event)).join('\n'), [events])

  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollCodeBlockToEnd(rawCodeBlockRef.current))
    return () => cancelAnimationFrame(frame)
  }, [rawEvents])

  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollCodeBlockToEnd(htmlCodeBlockRef.current))
    return () => cancelAnimationFrame(frame)
  }, [widget?.code])

  const stageStatus = running ? 'accent' : widget?.final ? 'success' : 'neutral'
  const loadingMessage = widget?.loadingMessage || (running ? selectedCase.loadingMessages[0] : 'No active stream')
  const controls = (
    <HStack gap={3} vAlign="end" hAlign="center" xstyle={styles.controls}>
      <StackItem size="fill">
        <Selector
          label="Example"
          isLabelHidden
          value={selectedId}
          options={playgroundCases.map(demoCase => ({ value: demoCase.id, label: demoCase.title }))}
          onChange={value => setSelectedId(value)}
          size="md"
          width="100%"
        />
      </StackItem>
      <Button
        label={running ? 'Restart replay' : 'Replay stream'}
        variant="primary"
        icon={<Icon icon={Play} size="sm" />}
        isIconOnly={isCompact}
        onClick={() => replay(selectedCase)}
      />
    </HStack>
  )

  return (
    <Layout
      height="fill"
      header={(
        <LayoutHeader padding={3} hasDivider label="Playground controls">
          {isCompact ? (
            <VStack gap={3}>
              <TabList value={activeStage} onChange={setActiveStage} layout="fill" size="sm" aria-label="Streaming pipeline stages">
                <Tab value="stream" label="Stream" />
                <Tab value="payload" label="Parsed" />
                <Tab value="render" label="Render" />
              </TabList>
              {controls}
            </VStack>
          ) : (
            <HStack gap={6} hAlign="between" vAlign="center">
              <VStack gap={0}>
                <Text weight="bold">Streaming Playground</Text>
                <Text type="supporting" color="secondary">No model or API key · deterministic local replay</Text>
              </VStack>
              {controls}
            </HStack>
          )}
        </LayoutHeader>
      )}
      content={(
        <LayoutContent padding={0} isScrollable={false} label="StreamViz streaming playground" role="main">
          <Grid columns={3} gap={0} xstyle={styles.pipeline}>
            {!isCompact || activeStage === 'stream' ? (
              <VStack gap={3} padding={4} xstyle={styles.stage}>
                <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">01 · TOOL STREAM</Text><StatusDot variant={running ? 'accent' : events.length ? 'success' : 'neutral'} label={running ? copy.running : events.length ? 'Complete' : copy.idle} isPulsing={running} /></HStack>
                <Card padding={3} variant="muted" xstyle={styles.summary}>
                  <VStack gap={2} vAlign="between" height="100%">
                    <HStack gap={2} vAlign="center"><Icon icon={RadioTower} color="accent" size="sm" /><Text weight="bold">Local protocol replay</Text></HStack>
                    <HStack gap={2} vAlign="center"><StatusDot variant="success" label="No model or API key" /><Text type="code" color="secondary">deterministic preset</Text></HStack>
                    <Text type="code" color="secondary">application/x-ndjson · {events.length} events</Text>
                  </VStack>
                </Card>
                <StackItem size="fill" xstyle={styles.workspace}>
                  {events.length ? <CodeBlock ref={rawCodeBlockRef} code={rawEvents} language="json" title="raw tool stream" size="sm" width="100%" maxHeight="100%" isWrapped xstyle={styles.codeBlock} /> : <EmptyState isCompact icon={<Icon icon={RadioTower} />} title={copy.idle} description={copy.eventsEmpty} />}
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
                  {widget?.code ? <CodeBlock ref={htmlCodeBlockRef} code={widget.code} language="html" title={`widget_code · ${widget.code.length} chars`} size="sm" width="100%" maxHeight="100%" isWrapped xstyle={styles.codeBlock} /> : <EmptyState isCompact icon={<Icon icon={Braces} />} title="StreamViz parser" description="title, loading_messages, and widget_code are recovered as the payload grows." />}
                </StackItem>
              </VStack>
            ) : null}

            {!isCompact || activeStage === 'render' ? (
              <VStack gap={3} padding={4} xstyle={[styles.stage, styles.finalStage]}>
                <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">03 · LIVE RENDER</Text><StatusDot variant={stageStatus} label={widget?.final ? 'Rendered' : widget ? 'Updating' : 'Waiting'} isPulsing={Boolean(widget && !widget.final)} /></HStack>
                <Card padding={3} variant="muted" xstyle={styles.summary}>
                  <VStack gap={2} vAlign="between" height="100%">
                    <VStack gap={0.5}><Text type="code" color="secondary">example</Text><Text weight="bold">{selectedCase.title}</Text></VStack>
                    <Text type="supporting" color="secondary">{selectedCase.prompt}</Text>
                  </VStack>
                </Card>
                <StackItem size="fill" isScrollable xstyle={styles.renderWorkspace}>
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
                    />
                  ) : <EmptyState icon={<Icon icon={Braces} />} title="Live iframe" description={copy.artifactEmpty} />}
                </StackItem>
              </VStack>
            ) : null}
          </Grid>
        </LayoutContent>
      )}
    />
  )
}
