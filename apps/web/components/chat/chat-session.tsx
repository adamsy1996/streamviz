'use client'

import { Avatar } from '@astryxdesign/core/Avatar'
import { Banner } from '@astryxdesign/core/Banner'
import { Card } from '@astryxdesign/core/Card'
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatToolCalls,
} from '@astryxdesign/core/Chat'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'
import { HStack, Layout, LayoutContent, StackItem, VStack } from '@astryxdesign/core/Layout'
import { Markdown } from '@astryxdesign/core/Markdown'
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import { useTheme } from '@astryxdesign/core/theme'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { ChevronRightIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StreamVisualization } from 'streamviz/react'
import type { ConversationMessage, WidgetPayload } from './types'

type ChatSessionViewProps = {
  messages: ConversationMessage[]
  prompt: string
  isRunning: boolean
  isConfigured: boolean
  model: string
  onPromptChange: (value: string) => void
  onSubmit: (value: string) => void
  onStop: () => void
}

const styles = stylex.create({
  root: {
    width: '100%',
    height: '100%',
  },
  chatColumn: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  chatLayout: {
    flex: 1,
    minHeight: 0,
  },
  artifactPanel: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  artifactBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: spacingVars['--spacing-4'],
  },
  artifactCard: {
    marginBlockStart: spacingVars['--spacing-2'],
  },
})

const hasToolActivity = (message: ConversationMessage) => Boolean(message.widget || message.toolCalls?.length)
const visualizationToolNames = new Set(['visualize_read_me', 'visualize_show_widget'])

const getVisibleToolCalls = (message: ConversationMessage) => {
  const calls = message.toolCalls || []
  if (!message.widget) return calls
  return calls.filter(call => !visualizationToolNames.has(call.name))
}

function ArtifactPreview({ widget }: { widget: WidgetPayload }) {
  const { mode } = useTheme()
  return (
    <VStack xstyle={styles.artifactBody}>
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
    </VStack>
  )
}

function ArtifactCard({ widget, onOpen }: { widget: WidgetPayload; onOpen: () => void }) {
  return (
    <ClickableCard label={`Open ${widget.title}`} onClick={onOpen} variant="muted" padding={3} maxWidth={360} xstyle={styles.artifactCard}>
      <HStack gap={3} vAlign="center" width="100%">
        <Icon icon={DocumentTextIcon} size="md" color="secondary" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="label" weight="semibold">{widget.title}</Text>
            <Text type="supporting" color="secondary">{widget.final ? 'Interactive artifact' : 'Streaming artifact'}</Text>
          </VStack>
        </StackItem>
        <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
      </HStack>
    </ClickableCard>
  )
}

export function ChatSessionView({
  messages,
  prompt,
  isRunning,
  isConfigured,
  model,
  onPromptChange,
  onSubmit,
  onStop,
}: ChatSessionViewProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const [isArtifactOpen, setIsArtifactOpen] = useState(false)
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false)
  const autoOpenedArtifactRef = useRef<string | null>(null)
  const artifactResize = useResizable({
    defaultSize: 640,
    minSizePx: 480,
    maxSizePx: 960,
    autoSaveId: 'streamviz-chat-artifact-panel',
  })
  const artifactMessage = useMemo(
    () => [...messages].reverse().find(message => message.widget?.code),
    [messages],
  )
  const widget = artifactMessage?.widget || null

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(entries => {
      setIsNarrow((entries[0]?.contentRect.width || 0) <= 767)
      setIsLayoutReady(true)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isLayoutReady || !artifactMessage?.id || !widget?.code) return
    if (autoOpenedArtifactRef.current === artifactMessage.id) return
    autoOpenedArtifactRef.current = artifactMessage.id
    if (isNarrow) setIsArtifactDialogOpen(true)
    else setIsArtifactOpen(true)
  }, [artifactMessage?.id, isLayoutReady, isNarrow, widget?.code])

  const openArtifact = () => {
    if (isNarrow) setIsArtifactDialogOpen(true)
    else setIsArtifactOpen(true)
  }

  const composer = (
    <ChatComposer
      value={prompt}
      onChange={onPromptChange}
      onSubmit={onSubmit}
      onStop={onStop}
      isStopShown={isRunning}
      isDisabled={!isConfigured && !isRunning}
      placeholder="Ask anything…"
      density="spacious"
      footerActions={<Text type="supporting" color="secondary">AI can make mistakes. Verify important results.</Text>}
    />
  )

  return (
    <VStack ref={rootRef} xstyle={styles.root}>
      <Layout
        height="fill"
        content={(
          <LayoutContent padding={0}>
            <HStack height="100%">
              <VStack xstyle={styles.chatColumn}>
                <ChatLayout density="spacious" xstyle={styles.chatLayout} composer={composer}>
                  <ChatMessageList density="spacious" isStreaming={isRunning}>
                    {messages.map(message => {
                      const toolActive = message.role === 'assistant' && hasToolActivity(message)
                      const visibleToolCalls = getVisibleToolCalls(message)
                      const calls = visibleToolCalls.map(call => {
                        const detail = call.args !== undefined || call.result !== undefined
                          ? JSON.stringify({ input: call.args, output: call.result }, null, 2)
                          : ''
                        return {
                          key: call.id,
                          name: call.name,
                          status: call.status,
                          target: call.name === 'visualize_show_widget' && message.widget?.title ? message.widget.title : call.target,
                          additions: call.name === 'visualize_show_widget' ? message.widget?.code.length : undefined,
                          duration: call.completedAt ? `${((call.completedAt - call.startedAt) / 1000).toFixed(1)}s` : undefined,
                          errorMessage: call.error,
                          resultDetail: detail ? <CodeBlock code={detail} language="json" size="sm" width="100%" maxHeight={280} isWrapped container="section" /> : undefined,
                        }
                      })
                      const assistantText = message.text
                        ? <Markdown density="compact" headingLevelStart={3} isStreaming={message.isStreaming}>{message.text}</Markdown>
                        : <HStack gap={2} vAlign="center"><StatusDot variant="accent" label="Thinking…" isPulsing /><Text color="secondary">{message.widget?.loadingMessage || 'Thinking about the best response…'}</Text></HStack>

                      return (
                        <ChatMessage
                          key={message.id}
                          sender={message.role}
                          avatar={message.role === 'assistant' ? <Avatar name="StreamViz" size="md" /> : undefined}
                        >
                          {message.role === 'user' ? (
                            <ChatMessageBubble variant="filled">{message.text}</ChatMessageBubble>
                          ) : !toolActive ? (
                            <ChatMessageBubble variant="ghost">{assistantText}</ChatMessageBubble>
                          ) : null}

                          {calls.length ? <ChatToolCalls calls={calls} defaultIsExpanded /> : null}
                          {message.widget ? <ArtifactCard widget={message.widget} onOpen={openArtifact} /> : null}
                          {message.role === 'assistant' && toolActive && message.text ? <ChatMessageBubble variant="ghost">{assistantText}</ChatMessageBubble> : null}
                          {message.role === 'assistant' && !message.isStreaming ? <ChatMessageMetadata footer={<Text type="supporting" color="secondary">{model}</Text>} /> : null}
                          {message.error ? <Banner status="error" title="The agent could not complete this response." description={message.error} /> : null}
                        </ChatMessage>
                      )
                    })}
                  </ChatMessageList>
                </ChatLayout>
              </VStack>

              {!isNarrow && isArtifactOpen && widget ? (
                <>
                  <ResizeHandle
                    direction="horizontal"
                    resizable={artifactResize.props}
                    isReversed
                    pillPlacement="start"
                    hasDivider
                    label="Resize artifact panel"
                  />
                  <Card variant="transparent" height="100%" width={artifactResize.size} xstyle={styles.artifactPanel}>
                    <Toolbar
                      label="Artifact actions"
                      dividers={['bottom']}
                      startContent={(
                        <HStack gap={3} vAlign="center">
                          <Icon icon={DocumentTextIcon} size="sm" color="secondary" />
                          <VStack gap={0}>
                            <Text type="label" weight="semibold">{widget.title}</Text>
                            <Text type="supporting" color="secondary">{widget.final ? 'Interactive artifact' : 'Streaming live'}</Text>
                          </VStack>
                        </HStack>
                      )}
                      endContent={<IconButton label="Close artifact" icon={<Icon icon={XMarkIcon} size="sm" />} variant="ghost" size="sm" onClick={() => setIsArtifactOpen(false)} />}
                    />
                    <ArtifactPreview widget={widget} />
                  </Card>
                </>
              ) : null}
            </HStack>
          </LayoutContent>
        )}
      />

      {isNarrow ? (
        <Dialog isOpen={isArtifactDialogOpen} onOpenChange={setIsArtifactDialogOpen} purpose="info" variant="fullscreen">
          <Layout
            header={<DialogHeader title={widget?.title || 'Artifact'} subtitle={widget?.final ? 'Interactive artifact' : 'Streaming live'} hasDivider onOpenChange={setIsArtifactDialogOpen} />}
            content={<LayoutContent padding={0}>{widget ? <ArtifactPreview widget={widget} /> : null}</LayoutContent>}
          />
        </Dialog>
      ) : null}
    </VStack>
  )
}
