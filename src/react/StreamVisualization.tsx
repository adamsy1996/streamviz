import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCachedVisualizeWidgetHeight,
  setCachedVisualizeWidgetHeight,
  visualizeWidgetSourceKey,
} from '../core'
import { buildExportDocument, downloadTextFile, safeExportName, writePngDataUrlToClipboard } from './export'
import { clampHeight, estimateWidgetHeight, widgetSourceHasRenderableContent } from './content'
import { collectCssVars, resolveWidgetTheme, serializeThemeCssVars, VISUALIZE_WIDGET_VARS } from './theme'
import type { VisualizeWidgetFrameProps } from './types'
import { buildRuntimeDocument } from './runtimeDocument'

const spacingPx = (steps: number) => steps * 4
const COPY_FEEDBACK_DURATION_MS = 1000
const VISUALIZE_WIDGET_MIN_HEIGHT = spacingPx(12)
const VISUALIZE_WIDGET_MAX_HEIGHT = 1536
const DEFAULT_VISUALIZE_LOADING_MESSAGE = '正在生成可视化代码'
const VISUALIZE_LOADING_MESSAGE_DWELL_MS = 1000
const VISUALIZE_WIDGET_HEIGHT_SHRINK_TOLERANCE = spacingPx(8)
const VISUALIZE_WIDGET_SNAPSHOT_TIMEOUT_MS = 8000

const defaultRenderIcon = (
  name: 'check' | 'copy' | 'download' | 'code-xml',
  options: { className?: string },
) => {
  const label = name === 'check' ? '✓' : name === 'copy' ? '⧉' : name === 'download' ? '↓' : '</>'
  return <span className={options.className} aria-hidden="true">{label}</span>
}

export default function StreamVisualization({
  title,
  code,
  exportCode,
  loadingMessage,
  loadingMessages,
  loadingDwellMs = VISUALIZE_LOADING_MESSAGE_DWELL_MS,
  final,
  showActions = true,
  onSendPrompt,
  renderIcon = defaultRenderIcon,
  notify,
  writeImageToClipboard,
  theme,
  getTheme,
  cssVarNames = VISUALIZE_WIDGET_VARS,
}: VisualizeWidgetFrameProps) {
  const blockRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const idRef = useRef(`visualize-widget-${Math.random().toString(36).slice(2)}`)
  const [cssVars, setCssVars] = useState('')
  const sourceKey = useMemo(() => visualizeWidgetSourceKey(exportCode || code), [code, exportCode])
  const hasCode = String(code || '').trim().length > 0
  const hasRenderableCode = useMemo(() => widgetSourceHasRenderableContent(code), [code])
  const [height, setHeight] = useState(() =>
    getCachedVisualizeWidgetHeight(sourceKey) || VISUALIZE_WIDGET_MIN_HEIGHT
  )
  const [ready, setReady] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [renderReleased, setRenderReleased] = useState(() => Boolean(final && hasCode))
  const [lockedLoadingMessages, setLockedLoadingMessages] = useState<string[] | null>(null)
  const cssVarsRef = useRef('')
  const latestPayloadRef = useRef({ code: '', final: false })
  const measuredHeightRef = useRef<number | null>(null)
  const measuredHeightKeyRef = useRef('')
  const finalRef = useRef(final)
  finalRef.current = final
  const snapshotRequestRef = useRef<{
    resolve: (value: string) => void
    reject: (error: Error) => void
    timer: number
  } | null>(null)
  const srcDoc = useMemo(() => buildRuntimeDocument(idRef.current), [])
  const themeCssVars = useMemo(() => serializeThemeCssVars(theme), [theme])
  const resolvedTheme = resolveWidgetTheme(theme, getTheme)
  const providedLoadingMessages = useMemo(() => {
    const messages = Array.isArray(loadingMessages)
      ? loadingMessages.map((message) => String(message || '').trim()).filter(Boolean)
      : []
    const singleMessage = String(loadingMessage || '').trim()
    if (!messages.length && singleMessage && singleMessage !== DEFAULT_VISUALIZE_LOADING_MESSAGE) messages.push(singleMessage)
    return Array.from(new Set(messages))
  }, [loadingMessage, loadingMessages])
  const incomingLoadingMessages = useMemo(() => {
    return providedLoadingMessages.length ? providedLoadingMessages : [DEFAULT_VISUALIZE_LOADING_MESSAGE]
  }, [providedLoadingMessages])
  const effectiveLoadingMessages = lockedLoadingMessages || incomingLoadingMessages
  const activeLoadingMessage = effectiveLoadingMessages[loadingMessageIndex % effectiveLoadingMessages.length] || DEFAULT_VISUALIZE_LOADING_MESSAGE
  const displayCode = renderReleased ? code : ''
  const hasDisplayCode = String(displayCode || '').trim().length > 0
  const loading = !hasDisplayCode
  const actionsVisible = showActions && final && rendered && hasDisplayCode

  const postCurrentPayload = () => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) return
    frameWindow.postMessage({
      type: 'visualize-widget:update',
      id: idRef.current,
      html: latestPayloadRef.current.code,
      final: latestPayloadRef.current.final,
      cssVars: cssVarsRef.current,
      theme: resolvedTheme,
    }, '*')
  }

  useEffect(() => {
    const node = blockRef.current
    if (!node) return
    const nextCssVars = collectCssVars(window.getComputedStyle(node), cssVarNames) + themeCssVars
    cssVarsRef.current = nextCssVars
    setCssVars(nextCssVars)
  }, [cssVarNames, themeCssVars])

  useEffect(() => {
    setReady(false)
    setRendered(false)
  }, [srcDoc])

  useEffect(() => {
    setLoadingMessageIndex(0)
  }, [effectiveLoadingMessages])

  useEffect(() => {
    if (lockedLoadingMessages) return
    if (providedLoadingMessages.length) {
      setLockedLoadingMessages(providedLoadingMessages)
      return
    }
    if (hasCode) setLockedLoadingMessages([DEFAULT_VISUALIZE_LOADING_MESSAGE])
  }, [hasCode, lockedLoadingMessages, providedLoadingMessages])

  useEffect(() => {
    if (!hasCode) {
      setRenderReleased(false)
      return undefined
    }
    if (loadingDwellMs <= 0) {
      setRenderReleased(true)
      return undefined
    }
    if (!hasRenderableCode && !final) {
      setRenderReleased(false)
      return undefined
    }
    if (final) {
      setRenderReleased(true)
      return undefined
    }
    if (renderReleased) return undefined
    const dwellMs = loadingDwellMs * effectiveLoadingMessages.length
    const timer = window.setTimeout(() => setRenderReleased(true), dwellMs)
    return () => window.clearTimeout(timer)
  }, [effectiveLoadingMessages.length, final, hasCode, hasRenderableCode, loadingDwellMs, renderReleased])

  useEffect(() => {
    if (!loading || effectiveLoadingMessages.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setLoadingMessageIndex((index) => index + 1)
    }, VISUALIZE_LOADING_MESSAGE_DWELL_MS)
    return () => window.clearInterval(timer)
  }, [effectiveLoadingMessages.length, loading])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const data = event.data || {}
      if (data.id !== idRef.current) return
      if (data.type === 'visualize-widget:ready') {
        setReady(true)
        postCurrentPayload()
        return
      }
      if (data.type === 'visualize-widget:rendered') {
        const hasContent = Boolean(data.hasContent)
        setRendered(hasContent)
        if (!hasContent && !finalRef.current) setRenderReleased(false)
        return
      }
      if (data.type === 'visualize-widget:snapshot') {
        const pending = snapshotRequestRef.current
        if (!pending) return
        window.clearTimeout(pending.timer)
        snapshotRequestRef.current = null
        if (data.error) {
          pending.reject(new Error(String(data.error)))
          return
        }
        pending.resolve(String(data.dataUrl || ''))
        return
      }
      if (data.type === 'visualize-widget:send-prompt') {
        const prompt = String(data.prompt || '').trim().slice(0, 4000)
        if (prompt) onSendPrompt?.(prompt)
        return
      }
      if (data.type !== 'visualize-widget:size') return
      if (data.hasContent === false) {
        measuredHeightRef.current = null
        measuredHeightKeyRef.current = ''
        if (!finalRef.current) {
          setHeight((previous) => previous > VISUALIZE_WIDGET_MIN_HEIGHT ? VISUALIZE_WIDGET_MIN_HEIGHT : previous)
        }
        return
      }
      const nextHeight = clampHeight(Number(data.height) || 0, VISUALIZE_WIDGET_MIN_HEIGHT, VISUALIZE_WIDGET_MAX_HEIGHT)
      measuredHeightRef.current = nextHeight
      measuredHeightKeyRef.current = visualizeWidgetSourceKey(latestPayloadRef.current.code)
      if (sourceKey && nextHeight > VISUALIZE_WIDGET_MIN_HEIGHT) setCachedVisualizeWidgetHeight(sourceKey, nextHeight)
      setHeight((previous) => {
        if (Math.abs(previous - nextHeight) <= 2) return previous
        if (finalRef.current && nextHeight + VISUALIZE_WIDGET_HEIGHT_SHRINK_TOLERANCE < previous) return previous
        return nextHeight
      })
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSendPrompt, resolvedTheme, sourceKey])

  useEffect(() => () => {
    const pending = snapshotRequestRef.current
    if (!pending) return
    window.clearTimeout(pending.timer)
    snapshotRequestRef.current = null
    pending.reject(new Error('snapshot cancelled'))
  }, [])

  useEffect(() => {
    finalRef.current = final
    if (!hasDisplayCode || !rendered) {
      if (!final) {
        setHeight((previous) => previous === VISUALIZE_WIDGET_MIN_HEIGHT ? previous : VISUALIZE_WIDGET_MIN_HEIGHT)
      }
      if (!hasDisplayCode) setRendered(false)
      if (!hasDisplayCode) {
        measuredHeightRef.current = null
        measuredHeightKeyRef.current = ''
      }
      latestPayloadRef.current = { code: displayCode, final }
      postCurrentPayload()
      const raf = window.requestAnimationFrame(postCurrentPayload)
      const timers = [
        window.setTimeout(postCurrentPayload, 50),
        window.setTimeout(postCurrentPayload, 200),
        window.setTimeout(postCurrentPayload, 600),
      ]
      return () => {
        window.cancelAnimationFrame(raf)
        timers.forEach((timer) => window.clearTimeout(timer))
      }
    }
    const displayHeightKey = visualizeWidgetSourceKey(displayCode)
    const measuredHeight = measuredHeightKeyRef.current === displayHeightKey ? measuredHeightRef.current : null
    const cachedHeight = sourceKey ? getCachedVisualizeWidgetHeight(sourceKey) : null
    const estimatedHeight = measuredHeight || cachedHeight || estimateWidgetHeight(exportCode || displayCode, final)
    setHeight((previous) => {
      if (Math.abs(previous - estimatedHeight) <= 2) return previous
      if (!final && previous > estimatedHeight) return previous
      return estimatedHeight
    })
    if (!hasDisplayCode) setRendered(false)
    latestPayloadRef.current = { code: displayCode, final }
    postCurrentPayload()
    const raf = window.requestAnimationFrame(postCurrentPayload)
    const timers = [
      window.setTimeout(postCurrentPayload, 50),
      window.setTimeout(postCurrentPayload, 200),
      window.setTimeout(postCurrentPayload, 600),
    ]
    return () => {
      window.cancelAnimationFrame(raf)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [cssVars, displayCode, exportCode, final, hasDisplayCode, ready, rendered, resolvedTheme, sourceKey, srcDoc])

  const exportHtml = () => {
    downloadTextFile(buildExportDocument(exportCode || code, title), `${safeExportName(title)}.html`)
  }

  const requestIframeSnapshotDataUrl = async (frameWindow: Window) => new Promise<string>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (snapshotRequestRef.current) snapshotRequestRef.current = null
      reject(new Error('snapshot timeout'))
    }, VISUALIZE_WIDGET_SNAPSHOT_TIMEOUT_MS)
    snapshotRequestRef.current = { resolve, reject, timer }
    frameWindow.postMessage({ type: 'visualize-widget:copy-snapshot', id: idRef.current }, '*')
  })

  const copySnapshot = async () => {
    if (copying) return
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) {
      notify?.('复制截图失败', 'error')
      return
    }
    setCopying(true)
    setCopied(false)
    try {
      const dataUrl = await requestIframeSnapshotDataUrl(frameWindow)
      if (!dataUrl) throw new Error('empty snapshot')
      const copiedDataUrl = await writePngDataUrlToClipboard(dataUrl, writeImageToClipboard)
      if (!copiedDataUrl) throw new Error('clipboard unavailable')
      setCopied(true)
      notify?.('已复制到剪贴板', 'success')
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
    } catch (_error) {
      notify?.('复制截图失败', 'error')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div
      ref={blockRef}
      className={`visualize-widget-block${loading ? ' is-loading' : ' is-ready'}${final ? ' is-final' : ' is-streaming'}`}
      data-source-key={sourceKey}
    >
      {actionsVisible ? (
        <div className="visualize-widget-actions" aria-label="可视化预览操作">
          <button className={`visualize-widget-action${copied ? ' is-copied' : ''}`} type="button" aria-label="复制可视化截图" data-tooltip={copied ? '已复制截图' : '复制截图'} onClick={copySnapshot}>
            {renderIcon(copied ? 'check' : 'copy', {})}
          </button>
          <button className="visualize-widget-action" type="button" aria-label="导出 HTML" data-tooltip="导出 HTML" onClick={exportHtml}>
            {renderIcon('download', {})}
          </button>
        </div>
      ) : null}
      {loading ? (
        <div className="visualize-widget-loading-inline" aria-live="polite">
          {renderIcon('code-xml', { className: 'visualize-widget-loading-icon' })}
          <span className="visualize-widget-loading-text">{activeLoadingMessage}</span>
        </div>
      ) : (
        <div
          className="visualize-widget-panel"
          style={{
            '--runtime-visualize-widget-height': `${height}px`,
            '--visualize-widget-height': `${height}px`,
          } as React.CSSProperties}
        >
          <iframe
            ref={iframeRef}
            className="visualize-widget-frame"
            title={title || '可视化预览'}
            sandbox="allow-scripts allow-forms"
            srcDoc={srcDoc}
            onLoad={() => {
              setReady(true)
              window.requestAnimationFrame(postCurrentPayload)
            }}
          />
        </div>
      )}
    </div>
  )
}
