'use client'

import * as stylex from '@stylexjs/stylex'
import { ChatMessage, ChatMessageBubble, ChatMessageList } from '@astryxdesign/core/Chat'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, VStack } from '@astryxdesign/core/Layout'
import { StackItem } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import { Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { borderVars, colorVars, durationVars, easeVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type AnimationEvent, type RefObject, useEffect, useRef, useState } from 'react'
import { StreamVisualization } from 'streamviz-react/react'
import { homeDemoCases, type HomeDemoCase } from '@/lib/home-demo-cases'

function buildModelSse(demoCase: HomeDemoCase) {
  const toolArguments = JSON.stringify({ title: demoCase.title, loading_messages: demoCase.loadingMessages, widget_code: demoCase.code })
  const argumentChunks = toolArguments.match(/[\s\S]{1,180}/g) ?? []
  return [
    `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { role: 'assistant', content: null } }] })}`,
    `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: demoCase.callId, type: 'function', function: { name: 'visualize_show_widget', arguments: '' } }] } }] })}`,
    ...argumentChunks.map(argumentsDelta => `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: argumentsDelta } }] } }] })}`),
    `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] })}`,
    'data: [DONE]',
  ].join('\n\n')
}

type CaseTransition = {
  direction: -1 | 1
  fromIndex: number
  toIndex: number
  fromProgress: number
} | null

const STREAM_START_PROGRESS = 0
const STREAM_PROGRESS_STEP = 1
const STREAM_TICK_MS = 160
const CASE_READING_TIME_MS = 12_000

const exitPrevious = stylex.keyframes({
  from: { opacity: 1, transform: 'translateX(0)' },
  to: { opacity: 0, transform: 'translateX(clamp(160px, 18vw, 320px)) scale(0.985)' },
})

const exitNext = stylex.keyframes({
  from: { opacity: 1, transform: 'translateX(0)' },
  to: { opacity: 0, transform: 'translateX(clamp(-320px, -18vw, -160px)) scale(0.985)' },
})

const enterPrevious = stylex.keyframes({
  from: { opacity: 0, transform: 'translateX(clamp(-320px, -18vw, -160px)) scale(0.985)' },
  to: { opacity: 1, transform: 'translateX(0)' },
})

const enterNext = stylex.keyframes({
  from: { opacity: 0, transform: 'translateX(clamp(160px, 18vw, 320px)) scale(0.985)' },
  to: { opacity: 1, transform: 'translateX(0)' },
})

const styles = stylex.create({
  caseSwitcher: {
    position: 'relative',
    width: '100%',
  },
  caseViewport: {
    position: 'relative',
    isolation: 'isolate',
  },
  sideNavigation: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 2,
    width: `max(calc(${spacingVars['--spacing-12']} * 2), calc((100vw - 100%) / 2))`,
    overflow: 'hidden',
    opacity: {
      default: 0.3,
      ':hover': 0.72,
    },
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (max-width: 80rem)': {
      display: 'none',
    },
  },
  sidePreview: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-3'],
  },
  previousPreview: {
    maskImage: 'linear-gradient(to right, transparent 0%, black 58%, black 100%)',
  },
  nextPreview: {
    maskImage: 'linear-gradient(to right, black 0%, black 42%, transparent 100%)',
  },
  sidePreviewContent: {
    width: 'min(68rem, 78vw)',
    maxWidth: 'none',
    flexShrink: 0,
    transform: 'scale(0.44)',
    transformOrigin: 'center center',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  sideNavigationTransitioning: {
    opacity: 0,
    pointerEvents: 'none',
  },
  sideNavigationButton: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    width: '100%',
    padding: spacingVars['--spacing-6'],
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: {
      default: colorVars['--color-icon-secondary'],
      ':hover': colorVars['--color-icon-primary'],
      ':focus-visible': colorVars['--color-accent'],
    },
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  },
  previousNavigation: {
    insetInlineEnd: '100%',
  },
  nextNavigation: {
    insetInlineStart: '100%',
  },
  compactNavigation: {
    display: 'none',
    '@media (max-width: 80rem)': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: spacingVars['--spacing-2'],
      marginTop: spacingVars['--spacing-3'],
    },
  },
  compactNavigationButton: {
    minHeight: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-4'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-background-muted'],
    },
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    font: 'inherit',
  },
  caseSurface: {
    willChange: 'opacity, transform',
  },
  incomingSurface: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
  },
  exitPrevious: {
    animationName: exitPrevious,
    animationDuration: durationVars['--duration-medium'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'both',
  },
  exitNext: {
    animationName: exitNext,
    animationDuration: durationVars['--duration-medium'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'both',
  },
  enterPrevious: {
    animationName: enterPrevious,
    animationDuration: durationVars['--duration-medium'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'both',
  },
  enterNext: {
    animationName: enterNext,
    animationDuration: durationVars['--duration-medium'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'both',
  },
  pipeline: {
    gridTemplateColumns: 'minmax(0, 0.52fr) minmax(0, 0.64fr) minmax(0, 1.34fr)',
    height: '78vh',
    minHeight: `calc(${spacingVars['--spacing-12']} * 14)`,
    maxHeight: `calc(${spacingVars['--spacing-12']} * 18)`,
    '@media (max-width: 64rem)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      height: 'auto',
      maxHeight: 'none',
    },
  },
  stage: {
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
    '@media (max-width: 64rem)': {
      minHeight: `calc(${spacingVars['--spacing-12']} * 10)`,
      height: `calc(${spacingVars['--spacing-12']} * 10)`,
      maxHeight: `calc(${spacingVars['--spacing-12']} * 10)`,
      borderInlineEndWidth: spacingVars['--spacing-0'],
      borderBlockEndWidth: borderVars['--border-width'],
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: colorVars['--color-border'],
    },
  },
  finalStage: {
    borderInlineEndWidth: spacingVars['--spacing-0'],
    '@media (max-width: 64rem)': {
      borderBlockEndWidth: spacingVars['--spacing-0'],
    },
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
  chat: {
    minHeight: 0,
    overflowY: 'auto',
  },
})

type SurfaceMotion = 'rest' | 'exit-previous' | 'exit-next' | 'enter-previous' | 'enter-next'

type DemoSurfaceProps = {
  demoCase: HomeDemoCase
  progress: number
  mode: 'light' | 'dark'
  isMounted: boolean
  isCompact: boolean
  activeStage: string
  onStageChange: (stage: string) => void
  motion?: SurfaceMotion
  rawCodeBlockRef?: RefObject<HTMLPreElement | null>
  htmlCodeBlockRef?: RefObject<HTMLPreElement | null>
  onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void
}

function DemoSurface({ demoCase, progress, mode, isMounted, isCompact, activeStage, onStageChange, motion = 'rest', rawCodeBlockRef, htmlCodeBlockRef, onAnimationEnd }: DemoSurfaceProps) {
  const modelSseSource = buildModelSse(demoCase)
  const code = demoCase.codeAtProgress(progress)
  const source = modelSseSource.slice(0, Math.floor(modelSseSource.length * progress / 100))
  const htmlFragment = demoCase.code.slice(0, Math.floor(demoCase.code.length * progress / 100))
  const final = progress === 100
  const phase = progress < 43 ? 0 : progress < 76 ? 1 : 2
  const loadingMessages = demoCase.loadingMessages
  const prompt = demoCase.prompt
  return (
    <Card
      data-home-case-surface={motion}
      padding={0}
      elevation="med"
      width="100%"
      xstyle={[
        styles.caseSurface,
        motion.startsWith('enter') && styles.incomingSurface,
        motion === 'exit-previous' && styles.exitPrevious,
        motion === 'exit-next' && styles.exitNext,
        motion === 'enter-previous' && styles.enterPrevious,
        motion === 'enter-next' && styles.enterNext,
      ]}
      onAnimationEnd={onAnimationEnd}
    >
      <HStack padding={3} vAlign="center">
        <HStack gap={2} vAlign="center">
          <StatusDot variant="success" label="Live" isPulsing={!final} />
          <Text type="code" color="accent">{demoCase.visualizeType}</Text>
          <Text type="supporting">{demoCase.title}</Text>
        </HStack>
      </HStack>
      {isCompact ? (
        <TabList value={activeStage} onChange={onStageChange} layout="fill" size="sm" aria-label="Streaming pipeline stages">
          <Tab value="stream" label="Stream" />
          <Tab value="payload" label="Parsed" />
          <Tab value="artifact" label="Chat" />
        </TabList>
      ) : null}
      <Grid columns={3} gap={0} xstyle={styles.pipeline}>
        {!isCompact || activeStage === 'stream' ? <VStack data-demo-stage="stream" gap={3} padding={4} xstyle={styles.stage}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">01 · MODEL STREAM</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Complete' : 'Streaming'} isPulsing={!final} /></HStack>
          <Card padding={3} variant="muted" xstyle={styles.summary}>
            <VStack gap={2} vAlign="between" height="100%">
              <HStack gap={2} vAlign="center"><Icon icon="arrowDown" color="accent" size="sm" /><Text weight="bold">POST /v1/chat/completions</Text></HStack>
              <Text type="code" color="secondary">text/event-stream · OpenAI-compatible SSE</Text>
            </VStack>
          </Card>
          <StackItem size="fill" xstyle={styles.workspace}>
            <CodeBlock ref={rawCodeBlockRef} code={source} language="json" title="raw response" size="sm" width="100%" maxHeight={`calc(100% - ${spacingVars['--spacing-10']})`} isWrapped xstyle={styles.codeBlock} />
          </StackItem>
        </VStack> : null}

        {!isCompact || activeStage === 'payload' ? <VStack data-demo-stage="payload" gap={3} padding={4} xstyle={styles.stage}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">02 · PARSED PAYLOAD</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Ready' : 'Parsing'} isPulsing={!final} /></HStack>
          <Card padding={3} variant="muted" xstyle={styles.summary}>
            <VStack gap={2}>
              <VStack gap={0.5}><Text type="code" color="secondary">title</Text><Text weight="bold" maxLines={1}>{demoCase.title}</Text></VStack>
              <VStack gap={0.5}><Text type="code" color="secondary">loading_message</Text><Text weight="bold" maxLines={1}>{final ? 'Render complete' : loadingMessages[phase]}</Text></VStack>
            </VStack>
          </Card>
          <StackItem size="fill" xstyle={styles.workspace}>
            <CodeBlock ref={htmlCodeBlockRef} code={htmlFragment} language="html" title={`widget_code · ${Math.ceil(htmlFragment.length / 1024)} KB`} size="sm" width="100%" maxHeight={`calc(100% - ${spacingVars['--spacing-10']})`} isWrapped xstyle={styles.codeBlock} />
          </StackItem>
        </VStack> : null}

        {!isCompact || activeStage === 'artifact' ? <VStack data-demo-stage="artifact" gap={3} padding={4} xstyle={[styles.stage, styles.finalStage]}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">03 · ASTRYX CHAT</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Rendered' : 'Updating'} isPulsing={!final} /></HStack>
          <Card padding={3} variant="muted" xstyle={styles.summary}>
            <VStack gap={2} vAlign="between" height="100%">
              <VStack gap={0.5}><Text type="code" color="secondary">surface</Text><Text weight="bold">Assistant message · live artifact</Text></VStack>
              <Text type="supporting" color="secondary">Prompt, tool state, and rendered output stay in one conversation flow.</Text>
            </VStack>
          </Card>
          <StackItem size="fill" isScrollable xstyle={styles.chat}>
            <ChatMessageList density="compact" gap={3} isStreaming={!final}>
              <ChatMessage sender="user"><ChatMessageBubble>{prompt}</ChatMessageBubble></ChatMessage>
              <ChatMessage sender="assistant">
                {final ? <ChatMessageBubble variant="ghost" name="StreamViz">{demoCase.readyMessage}</ChatMessageBubble> : null}
                {isMounted ? <StreamVisualization title={demoCase.title} code={code} exportCode={demoCase.code} loadingMessage="" loadingMessages={[...demoCase.loadingMessages]} final={final} theme={{ mode }} /> : <Card minHeight={`calc(${spacingVars['--spacing-12']} * 8)`} variant="muted" />}
              </ChatMessage>
            </ChatMessageList>
          </StackItem>
        </VStack> : null}
      </Grid>
    </Card>
  )
}

export function HomeArtifactDemo() {
  const [progress, setProgress] = useState(STREAM_START_PROGRESS)
  const [isMounted, setIsMounted] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [activeStage, setActiveStage] = useState('artifact')
  const [activeCaseIndex, setActiveCaseIndex] = useState(0)
  const [caseTransition, setCaseTransition] = useState<CaseTransition>(null)
  const [isPointerInside, setIsPointerInside] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const rawCodeBlockRef = useRef<HTMLPreElement>(null)
  const htmlCodeBlockRef = useRef<HTMLPreElement>(null)
  const rawFollowsStreamRef = useRef(true)
  const htmlFollowsStreamRef = useRef(true)
  const activeCase = homeDemoCases[activeCaseIndex]
  const previousCase = homeDemoCases[(activeCaseIndex - 1 + homeDemoCases.length) % homeDemoCases.length]
  const nextCase = homeDemoCases[(activeCaseIndex + 1) % homeDemoCases.length]
  const isAutoAdvancePaused = isPointerInside || isFocusWithin || !isPageVisible
  const { mode } = useTheme()

  useEffect(() => setIsMounted(true), [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 64rem)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const update = () => setIsPageVisible(document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(100)
      return
    }
    const timer = window.setInterval(() => setProgress(value => value >= 100 ? value : Math.min(100, value + STREAM_PROGRESS_STEP)), STREAM_TICK_MS)
    return () => window.clearInterval(timer)
  }, [])

  const showCase = (direction: -1 | 1) => {
    if (caseTransition) return
    const toIndex = (activeCaseIndex + direction + homeDemoCases.length) % homeDemoCases.length
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActiveCaseIndex(toIndex)
      setProgress(100)
      return
    }
    setCaseTransition({ direction, fromIndex: activeCaseIndex, toIndex, fromProgress: progress })
    setProgress(STREAM_START_PROGRESS)
    rawFollowsStreamRef.current = true
    htmlFollowsStreamRef.current = true
  }

  useEffect(() => {
    if (progress < 100 || caseTransition || isAutoAdvancePaused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => showCase(1), CASE_READING_TIME_MS)
    return () => window.clearTimeout(timer)
  }, [activeCaseIndex, caseTransition, isAutoAdvancePaused, progress])

  const handleCaseAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return
    if (!caseTransition) return
    setActiveCaseIndex(caseTransition.toIndex)
    setCaseTransition(null)
  }

  useEffect(() => {
    const bindFollowState = (root: HTMLPreElement | null, followsStreamRef: { current: boolean }) => {
      const scrollContainer = root?.querySelector<HTMLElement>('[role="group"]')
      if (!scrollContainer) return undefined
      const update = () => {
        followsStreamRef.current = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 32
      }
      scrollContainer.addEventListener('scroll', update, { passive: true })
      return () => scrollContainer.removeEventListener('scroll', update)
    }
    const unbindRaw = bindFollowState(rawCodeBlockRef.current, rawFollowsStreamRef)
    const unbindHtml = bindFollowState(htmlCodeBlockRef.current, htmlFollowsStreamRef)
    return () => {
      unbindRaw?.()
      unbindHtml?.()
    }
  }, [activeStage, isCompact])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const rawScrollContainer = rawCodeBlockRef.current?.querySelector<HTMLElement>('[role="group"]')
      const htmlScrollContainer = htmlCodeBlockRef.current?.querySelector<HTMLElement>('[role="group"]')
      if (rawFollowsStreamRef.current && rawScrollContainer) rawScrollContainer.scrollTop = rawScrollContainer.scrollHeight
      if (htmlFollowsStreamRef.current && htmlScrollContainer) htmlScrollContainer.scrollTop = htmlScrollContainer.scrollHeight
    })
    return () => window.cancelAnimationFrame(frame)
  }, [progress])

  const displayedCaseIndex = caseTransition?.fromIndex ?? activeCaseIndex
  const displayedCase = homeDemoCases[displayedCaseIndex]
  const displayedProgress = caseTransition?.fromProgress ?? progress
  const outgoingMotion: SurfaceMotion = caseTransition
    ? (caseTransition.direction === 1 ? 'exit-next' : 'exit-previous')
    : 'rest'

  return (
    <div {...stylex.props(styles.caseSwitcher)}>
      <div data-side-preview="previous" {...stylex.props(styles.sideNavigation, styles.previousNavigation, caseTransition && styles.sideNavigationTransitioning)}>
        <div {...stylex.props(styles.sidePreview, styles.previousPreview)}>
          <div {...stylex.props(styles.sidePreviewContent)}>
            {isMounted ? <StreamVisualization title={previousCase.title} code={previousCase.code} exportCode={previousCase.code} loadingMessage="" final showActions={false} theme={{ mode }} /> : null}
          </div>
        </div>
        <button type="button" aria-label="Previous case" {...stylex.props(styles.sideNavigationButton)} onClick={() => void showCase(-1)}>
          <ChevronLeft aria-hidden="true" size={32} strokeWidth={1.25} />
        </button>
      </div>
      <div data-side-preview="next" {...stylex.props(styles.sideNavigation, styles.nextNavigation, caseTransition && styles.sideNavigationTransitioning)}>
        <div {...stylex.props(styles.sidePreview, styles.nextPreview)}>
          <div {...stylex.props(styles.sidePreviewContent)}>
            {isMounted ? <StreamVisualization title={nextCase.title} code={nextCase.code} exportCode={nextCase.code} loadingMessage="" final showActions={false} theme={{ mode }} /> : null}
          </div>
        </div>
        <button type="button" aria-label="Next case" {...stylex.props(styles.sideNavigationButton)} onClick={() => void showCase(1)}>
          <ChevronRight aria-hidden="true" size={32} strokeWidth={1.25} />
        </button>
      </div>
      <div
        data-demo-autoplay={isAutoAdvancePaused ? 'paused' : 'playing'}
        {...stylex.props(styles.caseViewport)}
        onPointerEnter={() => setIsPointerInside(true)}
        onPointerLeave={() => setIsPointerInside(false)}
        onFocusCapture={() => setIsFocusWithin(true)}
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocusWithin(false)
        }}
      >
        <DemoSurface
          key={displayedCase.id}
          demoCase={displayedCase}
          progress={displayedProgress}
          mode={mode}
          isMounted={isMounted}
          isCompact={isCompact}
          activeStage={activeStage}
          onStageChange={setActiveStage}
          motion={outgoingMotion}
          rawCodeBlockRef={rawCodeBlockRef}
          htmlCodeBlockRef={htmlCodeBlockRef}
        />
        {caseTransition ? (
          <DemoSurface
            key={homeDemoCases[caseTransition.toIndex].id}
            demoCase={homeDemoCases[caseTransition.toIndex]}
            progress={progress}
            mode={mode}
            isMounted={isMounted}
            isCompact={isCompact}
            activeStage={activeStage}
            onStageChange={setActiveStage}
            motion={caseTransition.direction === 1 ? 'enter-next' : 'enter-previous'}
            onAnimationEnd={handleCaseAnimationEnd}
          />
        ) : null}
      </div>
      <div {...stylex.props(styles.compactNavigation)}>
        <button type="button" {...stylex.props(styles.compactNavigationButton)} onClick={() => void showCase(-1)}><ChevronLeft aria-hidden="true" size={20} />Previous case</button>
        <button type="button" {...stylex.props(styles.compactNavigationButton)} onClick={() => void showCase(1)}>Next case<ChevronRight aria-hidden="true" size={20} /></button>
      </div>
    </div>
  )
}
