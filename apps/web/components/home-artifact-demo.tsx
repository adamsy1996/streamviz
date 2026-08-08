'use client'

import { ChatMessage, ChatMessageBubble, ChatMessageList } from '@astryxdesign/core/Chat'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, VStack } from '@astryxdesign/core/Layout'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Heading, Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { useEffect, useMemo, useState } from 'react'
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
  const { mode } = useTheme()

  useEffect(() => setIsMounted(true), [])

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

  return (
    <Card padding={0} elevation="med" width="100%">
      <HStack padding={3} hAlign="between" vAlign="center">
        <HStack gap={2} vAlign="center"><StatusDot variant="success" label="Live" isPulsing={!final} /><Text type="supporting">Agent response · live</Text></HStack>
        <Text type="code" color="accent">{final ? 'ready' : `${progress}%`}</Text>
      </HStack>
      <Grid columns={{ minWidth: 320, max: 3 }} gap={0}>
        <VStack gap={4} padding={4}>
          <HStack hAlign="between" vAlign="center"><Text type="code" color="secondary">01 · RAW MODEL SSE</Text><StatusDot variant={final ? 'success' : 'accent'} label={final ? 'Complete' : 'Streaming'} isPulsing={!final} /></HStack>
          <HStack gap={2} vAlign="center"><Icon icon="arrowDown" color="accent" size="sm" /><Text weight="bold">POST /v1/chat/completions</Text></HStack>
          <CodeBlock code={source} language="json" title="text/event-stream" size="sm" width="100%" maxHeight={320} isWrapped />
          <Text type="supporting">{locale === 'zh' ? '完整保留模型 SSE 协议。' : 'The complete model SSE protocol remains inspectable.'}</Text>
        </VStack>

        <VStack gap={4} padding={4}>
          <Text type="code" color="secondary">02 · STREAMVIZ PARSER</Text>
          <Card padding={3} variant="muted"><VStack gap={1}><Text type="code" color="secondary">title</Text><Text weight="bold" maxLines={1}>Agent conversation sequence diagram</Text></VStack></Card>
          <Card padding={3} variant="muted"><VStack gap={1}><Text type="code" color="secondary">loading_message</Text><Text weight="bold" maxLines={1}>{final ? (locale === 'zh' ? '渲染完成' : 'Render complete') : loadingMessages[phase]}</Text></VStack></Card>
          <CodeBlock code={htmlFragment} language="html" title={`widget_code · ${Math.ceil(htmlFragment.length / 1024)} KB`} size="sm" width="100%" maxHeight={256} isWrapped />
        </VStack>

        <VStack gap={4} padding={4}>
          <Text type="code" color="secondary">03 · LIVE CONVERSATION</Text>
          <ChatMessageList density="compact" isStreaming={!final}>
            <ChatMessage sender="user"><ChatMessageBubble>{locale === 'zh' ? '生成一张 Agent 对话系统时序图。' : 'Create an Agent conversation system sequence diagram.'}</ChatMessageBubble></ChatMessage>
            <ChatMessage sender="assistant" name="StreamViz"><ChatMessageBubble variant="ghost">{locale === 'zh' ? '节点会随模型输出逐步出现。' : 'Nodes appear as the model streams them.'}</ChatMessageBubble></ChatMessage>
          </ChatMessageList>
          {isMounted ? (
            <StreamVisualization
              title={locale === 'zh' ? sequenceArtifact.titleZh : sequenceArtifact.title}
              code={code}
              exportCode={sequenceDemoCode}
              loadingMessage={locale === 'zh' ? '正在接收流式 HTML' : 'Receiving streamed HTML'}
              final={final}
              theme={{ mode }}
            />
          ) : <Card minHeight={420} variant="muted" />}
        </VStack>
      </Grid>
    </Card>
  )
}
