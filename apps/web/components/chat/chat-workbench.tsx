'use client'

import { AppShell } from '@astryxdesign/core/AppShell'
import { useCallback, useEffect, useRef, useState } from 'react'
import { extractVisualizeWidgetPayload } from 'streamviz/core'
import { ChatLanding } from '@/components/chat/chat-landing'
import { ChatSessionView } from '@/components/chat/chat-session'
import { SessionSidebar, type ChatSession } from '@/components/chat/session-sidebar'
import type { ConversationMessage, ToolCallRecord, WidgetPayload } from '@/components/chat/types'

type DebugEvent = {
  type: string
  runId?: string
  from?: string
  payload?: Record<string, unknown>
}
type AgentConfig = { provider: string; model: string; configured: boolean }

type PersistedToolInvocation = {
  state?: string
  toolCallId?: string
  toolName?: string
  args?: unknown
  result?: unknown
}

type PersistedMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt?: string
  toolInvocations?: PersistedToolInvocation[]
}

type SessionListResponse = {
  threads?: Array<{
    id: string
    title?: string
    createdAt: string
    updatedAt: string
  }>
  error?: string
}

const copy = {
  failed: 'The agent could not complete this response.',
  toolTarget: 'Streaming visualization',
} as const

const isErrorEvent = (event: DebugEvent) => event.type === 'error' || event.type === 'tool-error'

const getEventError = (event: DebugEvent) => {
  const payload = event.payload || {}
  const value = payload.error || payload.message
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  return value ? JSON.stringify(value) : copy.failed
}

const summarizeToolValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(summarizeToolValue)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if ((key === 'widget_code' || key === 'guide') && typeof entry === 'string') {
      return [key, `[${entry.length} characters]`]
    }
    return [key, summarizeToolValue(entry)]
  }))
}

const getToolTarget = (name: string, args: unknown, widget?: WidgetPayload | null) => {
  const input = args && typeof args === 'object' ? args as Record<string, unknown> : {}
  if (name === 'visualize_read_me') {
    return typeof input.type === 'string' ? `Visualization rules · ${input.type}` : 'Visualization rules'
  }
  if (name === 'visualize_show_widget') {
    return widget?.title || (typeof input.title === 'string' ? input.title : copy.toolTarget)
  }
  return name
}

const updateToolCalls = (
  current: ToolCallRecord[] | undefined,
  event: DebugEvent,
  widget?: WidgetPayload | null,
) => {
  if (!event.type.startsWith('tool-')) return current || []
  const payload = event.payload || {}
  const id = typeof payload.toolCallId === 'string' ? payload.toolCallId : ''
  const name = typeof payload.toolName === 'string' ? payload.toolName : ''
  if (!id) return current || []
  const calls = [...(current || [])]
  const index = calls.findIndex(call => call.id === id)
  const existing = index >= 0 ? calls[index] : undefined
  const resolvedName = name || existing?.name || 'tool'
  const args = 'args' in payload ? summarizeToolValue(payload.args) : existing?.args
  const isResult = event.type === 'tool-result'
  const isFailure = event.type === 'tool-error' || Boolean(payload.isError)
  const now = Date.now()
  const next: ToolCallRecord = {
    id,
    name: resolvedName,
    status: isFailure ? 'error' : isResult ? 'complete' : 'running',
    target: getToolTarget(resolvedName, args, widget) || existing?.target || resolvedName,
    args,
    result: 'result' in payload ? summarizeToolValue(payload.result) : existing?.result,
    error: isFailure ? getEventError(event) : existing?.error,
    startedAt: existing?.startedAt || now,
    completedAt: isResult || isFailure ? now : existing?.completedAt,
  }
  if (index >= 0) calls[index] = next
  else calls.push(next)
  return calls
}

const getPersistedWidget = (toolInvocations: PersistedToolInvocation[] | undefined) => {
  for (let index = (toolInvocations?.length || 0) - 1; index >= 0; index -= 1) {
    const invocation = toolInvocations?.[index]
    if (invocation?.toolName !== 'visualize_show_widget') continue
    const result = invocation.result && typeof invocation.result === 'object'
      ? invocation.result as Record<string, unknown>
      : {}
    const artifact = result.artifact && typeof result.artifact === 'object'
      ? result.artifact as Record<string, unknown>
      : result
    const metadata = Object.keys(artifact).length
      ? artifact
      : invocation.args && typeof invocation.args === 'object'
        ? invocation.args as Record<string, unknown>
        : {}
    return extractVisualizeWidgetPayload({ metadata, status: 'done' })
  }
  return null
}

const getPersistedToolCalls = (
  toolInvocations: PersistedToolInvocation[] | undefined,
  widget: WidgetPayload | null,
  createdAt?: string,
) => {
  const timestamp = createdAt ? new Date(createdAt).getTime() : Date.now()
  return (toolInvocations || []).map((invocation, index): ToolCallRecord => {
    const name = invocation.toolName || 'tool'
    const args = summarizeToolValue(invocation.args)
    const completed = invocation.state === 'result' || invocation.result !== undefined
    return {
      id: invocation.toolCallId || `persisted-${name}-${index}`,
      name,
      status: completed ? 'complete' : 'pending',
      target: getToolTarget(name, args, widget),
      args,
      result: invocation.result === undefined ? undefined : summarizeToolValue(invocation.result),
      startedAt: timestamp,
    }
  })
}

const normalizeSessions = (response: SessionListResponse): ChatSession[] => (response.threads || []).map(thread => ({
  id: thread.id,
  title: thread.title?.trim() || 'New conversation',
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
}))

const draftSessionTitle = (prompt: string) => prompt.length > 48 ? `${prompt.slice(0, 47).trimEnd()}…` : prompt

export function ChatWorkbench() {
  const [config, setConfig] = useState<AgentConfig>({ provider: '—', model: '—', configured: false })
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState('')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const threadIdRef = useRef<string | null>(null)

  const setThreadUrl = useCallback((threadId: string | null) => {
    const url = new URL(window.location.href)
    if (threadId) url.searchParams.set('thread', threadId)
    else url.searchParams.delete('thread')
    window.history.replaceState(null, '', url)
  }, [])

  const refreshSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions/', { cache: 'no-store' })
      const body = await response.json() as SessionListResponse
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
      const next = normalizeSessions(body)
      setSessions(current => next.map(session => {
        if (session.title !== 'New conversation') return session
        const optimistic = current.find(item => item.id === session.id)
        return optimistic?.title && optimistic.title !== 'New conversation'
          ? { ...session, title: optimistic.title }
          : session
      }))
      setSessionsError('')
      return next
    } catch (reason) {
      setSessionsError(reason instanceof Error ? reason.message : String(reason))
      return []
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  const resetConversation = useCallback(() => {
    generationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setPrompt('')
    setMessages([])
    threadIdRef.current = null
    setActiveSessionId(null)
    setThreadUrl(null)
  }, [setThreadUrl])

  const loadSession = useCallback(async (threadId: string) => {
    generationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setPrompt('')
    setActiveSessionId(threadId)
    threadIdRef.current = threadId
    setThreadUrl(threadId)

    const response = await fetch(`/api/sessions/${encodeURIComponent(threadId)}/`, { cache: 'no-store' })
    const body = await response.json() as { messages?: PersistedMessage[]; error?: string }
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
    setMessages((body.messages || []).map(message => {
      const widget = getPersistedWidget(message.toolInvocations)
      return {
        id: message.id,
        role: message.role,
        text: message.text || (widget ? 'Here is the interactive visualization.' : ''),
        widget,
        toolCalls: getPersistedToolCalls(message.toolInvocations, widget, message.createdAt),
        isStreaming: false,
      }
    }))
  }, [setThreadUrl])

  useEffect(() => {
    fetch('/api/chat/config/', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<AgentConfig>
      })
      .then(setConfig)
      .catch(() => setConfig({ provider: 'unknown', model: 'unknown', configured: false }))

    void refreshSessions().then(next => {
      const requestedThread = new URL(window.location.href).searchParams.get('thread')
      if (requestedThread) {
        if (next.some(session => session.id === requestedThread)) {
          void loadSession(requestedThread).catch(() => resetConversation())
        } else {
          resetConversation()
        }
      }
    })
    return () => abortRef.current?.abort()
  }, [loadSession, refreshSessions, resetConversation])

  const run = async (value = prompt) => {
    const normalized = value.trim()
    if (!normalized || running) return

    const generation = generationRef.current + 1
    generationRef.current = generation
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setPrompt('')

    const userId = crypto.randomUUID()
    const assistantId = crypto.randomUUID()
    const threadId = threadIdRef.current || crypto.randomUUID()
    const isNewSession = !threadIdRef.current
    threadIdRef.current = threadId
    setActiveSessionId(threadId)
    setThreadUrl(threadId)
    if (isNewSession) {
      const now = new Date().toISOString()
      setSessions(current => [{ id: threadId, title: draftSessionTitle(normalized), createdAt: now, updatedAt: now }, ...current])
    }
    const startedAt = Date.now()
    setMessages(current => [
      ...current,
      { id: userId, role: 'user', text: normalized },
      { id: assistantId, role: 'assistant', text: '', toolCalls: [], widget: null, isStreaming: true, startedAt },
    ])

    let buffer = ''
    let widgetArguments = ''
    let widgetToolCallId = ''
    try {
      const response = await fetch('/api/chat/', {
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
        buffer += decoder.decode(chunk.value, { stream: true })
        const normalizedBuffer = buffer.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
        const frames = normalizedBuffer.split('\n\n')
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

          setMessages(current => current.map(message => message.id === assistantId ? {
            ...message,
            text: message.text + textDelta,
            toolCalls: updateToolCalls(message.toolCalls, event, nextWidget || message.widget),
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
        void refreshSessions()
        window.setTimeout(() => void refreshSessions(), 1200)
        window.setTimeout(() => void refreshSessions(), 3000)
      }
    }
  }

  const renameSession = async (threadId: string, title: string) => {
    const response = await fetch(`/api/sessions/${encodeURIComponent(threadId)}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const body = await response.json().catch(() => ({})) as { error?: string }
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
    setSessions(current => current.map(session => session.id === threadId ? { ...session, title, updatedAt: new Date().toISOString() } : session))
  }

  const deleteSession = async (threadId: string) => {
    const response = await fetch(`/api/sessions/${encodeURIComponent(threadId)}/`, { method: 'DELETE' })
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string }
      throw new Error(body.error || `HTTP ${response.status}`)
    }
    setSessions(current => current.filter(session => session.id !== threadId))
    if (threadIdRef.current === threadId) resetConversation()
  }

  return (
    <AppShell
      contentPadding={0}
      height="fill"
      sideNav={(
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          isLoading={sessionsLoading}
          isRunning={running}
          error={sessionsError}
          agentStatus={config}
          onNewChat={resetConversation}
          onSelect={(sessionId) => void loadSession(sessionId).catch(reason => setSessionsError(reason instanceof Error ? reason.message : String(reason)))}
          onRename={renameSession}
          onDelete={deleteSession}
        />
      )}
    >
      {messages.length ? (
        <ChatSessionView
          messages={messages}
          prompt={prompt}
          isRunning={running}
          isConfigured={config.configured}
          model={config.model}
          onPromptChange={setPrompt}
          onSubmit={value => void run(value)}
          onStop={() => abortRef.current?.abort()}
        />
      ) : (
        <ChatLanding
          prompt={prompt}
          isRunning={running}
          isConfigured={config.configured}
          onPromptChange={setPrompt}
          onSubmit={value => void run(value)}
        />
      )}
    </AppShell>
  )
}
