'use client'

import * as stylex from '@stylexjs/stylex'
import { ChatMessage, ChatMessageBubble, ChatMessageList, ChatToolCalls } from '@astryxdesign/core/Chat'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, VStack } from '@astryxdesign/core/Layout'
import { StackItem } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Tab, TabList } from '@astryxdesign/core/TabList'
import { Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { borderVars, colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StreamVisualization } from 'streamviz/react'
import { sequenceArtifact } from '@/lib/artifact-examples'

const sequenceDemoCode = `<style>svg[data-visualize-root]{height:420px!important}</style>\n${sequenceArtifact.code}`
const toolArguments = JSON.stringify({ title: 'Agent conversation sequence diagram', loading_messages: ['Placing participants and lifelines', 'Tracing the conversation flow', 'Rendering the sequence diagram'], widget_code: sequenceDemoCode })
const argumentChunks = toolArguments.match(/[\s\S]{1,180}/g) ?? []
const modelSseSource = [
  `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { role: 'assistant', content: null } }] })}`,
  `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: 'call_streamviz_sequence', type: 'function', function: { name: 'visualize_show_widget', arguments: '' } }] } }] })}`,
  ...argumentChunks.map(argumentsDelta => `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: argumentsDelta } }] } }] })}`),
  `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] })}`,
  'data: [DONE]',
].join('\n\n')

const styles = stylex.create({
  pipeline: {
    gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 0.58fr) minmax(0, 1.12fr)',
    height: '72vh',
    minHeight: `calc(${spacingVars['--spacing-12']} * 13)`,
    maxHeight: `calc(${spacingVars['--spacing-12']} * 16)`,
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

function streamCompleteSvgNodes(code: string, progress: number) {
  const lines = code.trim().split('\n')
  const definitionsEnd = lines.findIndex(line => line.includes('</defs>'))
  if (definitionsEnd < 0 || progress >= 100) return code
  const prefix = lines.slice(0, definitionsEnd + 1)
  const nodes = lines.slice(definitionsEnd + 1, -1)
  const visibleNodeCount = Math.max(1, Math.floor(nodes.length * progress / 100))
  return [...prefix, ...nodes.slice(0, visibleNodeCount), '</svg>'].join('\n')
}

export function HomeArtifactDemo({ locale = 'en' }: { locale?: 'en' | 'zh' }) {
  const [progress, setProgress] = useState(100)
  const [isMounted, setIsMounted] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [activeStage, setActiveStage] = useState('artifact')
  const rawCodeBlockRef = useRef<HTMLPreElement>(null)
  const htmlCodeBlockRef = useRef<HTMLPreElement>(null)
  const rawFollowsStreamRef = useRef(true)
  const htmlFollowsStreamRef = useRef(true)
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setProgress(value => value >= 100 ? value : Math.min(100, value + 3)), 180)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress < 100) return
    const timer = window.setTimeout(() => setProgress(32), 3200)
    return () => window.clearTimeout(timer)
  }, [progress])

  const code = useMemo(() => streamCompleteSvgNodes(sequenceDemoCode, progress), [progress])
  const source = modelSseSource.slice(0, Math.floor(modelSseSource.length * progress / 100))
  const htmlFragment = sequenceDemoCode.slice(0, Math.floor(sequenceDemoCode.length * progress / 100))
  const final = progress === 100
  const phase = progress < 43 ? 0 : progress < 76 ? 1 : 2
  const loadingMessages = locale === 'zh' ? ['正在放置参与者和生命线', '正在梳理对话调用链', '正在渲染时序图'] : ['Placing participants and lifelines', 'Tracing the conversation flow', 'Rendering the sequence diagram']
  const prompt = locale === 'zh' ? '生成一张 Agent 对话系统时序图。' : 'Create an Agent conversation system sequence diagram.'
  const assistantText = final
    ? (locale === 'zh' ? '时序图已生成，你可以直接在对话中查看和交互。' : 'The sequence diagram is ready to inspect directly in the conversation.')
    : (locale === 'zh' ? loadingMessages[phase] : `${loadingMessages[phase]}. The artifact updates with the model stream.`)
  const toolStatus = final ? 'complete' : 'running'

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

  return (
    <Card padding={0} elevation="med" width="100%">
      <HStack padding={3} hAlign="between" vAlign="center">
        <HStack gap={2} vAlign="center"><StatusDot variant="success" label="Live" isPulsing={!final} /><Text type="supporting">Agent response · live</Text></HStack>
        <Text type="code" color="accent">{final ? 'ready' : `${progress}%`}</Text>
      </HStack>
      {isCompact ? (
        <TabList value={activeStage} onChange={setActiveStage} layout="fill" size="sm" aria-label={locale === 'zh' ? '流式处理阶段' : 'Streaming pipeline stages'}>
          <Tab value="stream" label={locale === 'zh' ? '模型流' : 'Stream'} />
          <Tab value="payload" label={locale === 'zh' ? '解析结果' : 'Parsed'} />
          <Tab value="artifact" label={locale === 'zh' ? '对话结果' : 'Chat'} />
        </TabList>
      ) : null}
      <Grid columns={3} gap={0} xstyle={styles.pipeline}>
        {!isCompact || activeStage === 'stream' ? <VStack gap={3} padding={4} xstyle={styles.stage}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">01 · MODEL STREAM</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Complete' : 'Streaming'} isPulsing={!final} /></HStack>
          <Card padding={3} variant="muted" xstyle={styles.summary}>
            <VStack gap={2} vAlign="between" height="100%">
              <HStack gap={2} vAlign="center"><Icon icon="arrowDown" color="accent" size="sm" /><Text weight="bold">POST /v1/chat/completions</Text></HStack>
              <Text type="code" color="secondary">text/event-stream · OpenAI-compatible SSE</Text>
            </VStack>
          </Card>
          <StackItem size="fill" xstyle={styles.workspace}>
            <CodeBlock
              ref={rawCodeBlockRef}
              code={source}
              language="json"
              title="raw response"
              size="sm"
              width="100%"
              maxHeight={`calc(100% - ${spacingVars['--spacing-10']})`}
              isWrapped
              xstyle={styles.codeBlock}
            />
          </StackItem>
        </VStack> : null}

        {!isCompact || activeStage === 'payload' ? <VStack gap={3} padding={4} xstyle={styles.stage}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">02 · PARSED PAYLOAD</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Ready' : 'Parsing'} isPulsing={!final} /></HStack>
          <Card padding={3} variant="muted" xstyle={styles.summary}>
            <VStack gap={2}>
              <VStack gap={0.5}><Text type="code" color="secondary">title</Text><Text weight="bold" maxLines={1}>Agent conversation sequence diagram</Text></VStack>
              <VStack gap={0.5}><Text type="code" color="secondary">loading_message</Text><Text weight="bold" maxLines={1}>{final ? (locale === 'zh' ? '渲染完成' : 'Render complete') : loadingMessages[phase]}</Text></VStack>
            </VStack>
          </Card>
          <StackItem size="fill" xstyle={styles.workspace}>
            <CodeBlock
              ref={htmlCodeBlockRef}
              code={htmlFragment}
              language="html"
              title={`widget_code · ${Math.ceil(htmlFragment.length / 1024)} KB`}
              size="sm"
              width="100%"
              maxHeight={`calc(100% - ${spacingVars['--spacing-10']})`}
              isWrapped
              xstyle={styles.codeBlock}
            />
          </StackItem>
        </VStack> : null}

        {!isCompact || activeStage === 'artifact' ? <VStack gap={3} padding={4} xstyle={[styles.stage, styles.finalStage]}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">03 · ASTRYX CHAT</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Rendered' : 'Updating'} isPulsing={!final} /></HStack>
          <Card padding={3} variant="muted" xstyle={styles.summary}>
            <VStack gap={2} vAlign="between" height="100%">
              <VStack gap={0.5}><Text type="code" color="secondary">surface</Text><Text weight="bold">Assistant message · live artifact</Text></VStack>
              <Text type="supporting" color="secondary">{locale === 'zh' ? '用户输入、工具状态与渲染结果处于同一条对话流中。' : 'Prompt, tool state, and rendered output stay in one conversation flow.'}</Text>
            </VStack>
          </Card>
          <StackItem size="fill" isScrollable xstyle={styles.chat}>
            <ChatMessageList density="compact" gap={3} isStreaming={!final}>
              <ChatMessage sender="user"><ChatMessageBubble>{prompt}</ChatMessageBubble></ChatMessage>
              <ChatMessage sender="assistant">
                <ChatMessageBubble variant="ghost" name="StreamViz">{assistantText}</ChatMessageBubble>
                <ChatToolCalls calls={[{
                  key: 'streamviz-sequence',
                  name: 'visualize_show_widget',
                  status: toolStatus,
                  target: 'Agent conversation sequence diagram',
                  additions: htmlFragment.length,
                }]} />
                {isMounted ? (
                  <StreamVisualization
                    title={locale === 'zh' ? sequenceArtifact.titleZh : sequenceArtifact.title}
                    code={code}
                    exportCode={sequenceDemoCode}
                    loadingMessage={locale === 'zh' ? '正在接收流式 HTML' : 'Receiving streamed HTML'}
                    final={final}
                    theme={{ mode }}
                  />
                ) : <Card minHeight={`calc(${spacingVars['--spacing-12']} * 8)`} variant="muted" />}
              </ChatMessage>
            </ChatMessageList>
          </StackItem>
        </VStack> : null}
      </Grid>
    </Card>
  )
}
