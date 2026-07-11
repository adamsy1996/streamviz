import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StreamVisualization } from './index'

const finalCode = [
  '<section>',
  '  <h2>Release readiness</h2>',
  '  <button onclick="sendPrompt(\'Create checklist\')">Checklist</button>',
  '  <script>window.__streamingVisualizationScriptRan = true;</script>',
  '</section>',
].join('')

const parseWidgetId = (iframe: HTMLIFrameElement) => {
  const match = String(iframe.srcdoc || '').match(/const widgetId = "([^"]+)"/)
  if (!match) throw new Error('missing widget id in srcDoc')
  return match[1]
}

describe('StreamVisualization', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    vi.restoreAllMocks()
  })

  it('mounts the recommended public API in a sandboxed iframe', async () => {
    await act(async () => {
      root.render(
        <StreamVisualization
          title="Release readiness"
          code={finalCode}
          exportCode={finalCode}
          loadingMessage="Generating artifact"
          loadingMessages={['Generating artifact']}
          final
        />,
      )
    })

    const iframe = host.querySelector('iframe')
    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts allow-forms')
    expect(iframe?.srcdoc).toContain('Content-Security-Policy')
    expect(iframe?.srcdoc).toContain("frame-src 'none'")
    expect(iframe?.srcdoc).toContain('visualize-widget:update')
  })

  it('falls back to the system color scheme when the host has no explicit theme', async () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false } as MediaQueryList)
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia })

    await act(async () => {
      root.render(
        <StreamVisualization
          title="Release readiness"
          code={finalCode}
          exportCode={finalCode}
          loadingMessage="Generating artifact"
          final
        />,
      )
    })

    const iframe = host.querySelector('iframe') as HTMLIFrameElement
    const widgetId = parseWidgetId(iframe)
    const postMessage = vi.spyOn(iframe.contentWindow as Window, 'postMessage')

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'visualize-widget:ready', id: widgetId },
        source: iframe.contentWindow,
      }))
    })

    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ theme: 'light' }), '*')
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('injects typed theme tokens after host variables', async () => {
    await act(async () => {
      root.render(
        <StreamVisualization
          title="Release readiness"
          code={finalCode}
          exportCode={finalCode}
          loadingMessage="Generating artifact"
          final
          theme={{
            mode: 'dark',
            tokens: {
              accent: '#7c6cff',
              backgroundSurface: '#101114',
              chartSeries: ['#7c6cff', '#2dd4bf'],
              textPrimary: 'red;}body{display:none',
            },
          }}
        />,
      )
    })

    const iframe = host.querySelector('iframe') as HTMLIFrameElement
    const widgetId = parseWidgetId(iframe)
    const postMessage = vi.spyOn(iframe.contentWindow as Window, 'postMessage')

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'visualize-widget:ready', id: widgetId },
        source: iframe.contentWindow,
      }))
    })

    const update = postMessage.mock.calls
      .map(([message]) => message as { cssVars?: string; theme?: string })
      .find((message) => message.theme === 'dark' && message.cssVars?.includes('--sv-accent:#7c6cff;'))

    expect(update?.cssVars).toContain('--sem-accent-primary:#7c6cff;')
    expect(update?.cssVars).toContain('--sv-bg-surface:#101114;')
    expect(update?.cssVars).toContain('--color-background-primary:#101114;')
    expect(update?.cssVars).toContain('--sv-chart-series-1:#7c6cff;')
    expect(update?.cssVars).toContain('--chart-series-2:#2dd4bf;')
    expect(update?.cssVars).not.toContain('display:none')
  })

  it('shows final actions only after the iframe reports rendered content', async () => {
    await act(async () => {
      root.render(
        <StreamVisualization
          title="Release readiness"
          code={finalCode}
          exportCode={finalCode}
          loadingMessage="Generating artifact"
          final
        />,
      )
    })

    const iframe = host.querySelector('iframe') as HTMLIFrameElement
    const widgetId = parseWidgetId(iframe)

    expect(host.querySelector('.visualize-widget-actions')).toBeNull()

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'visualize-widget:rendered', id: widgetId, hasContent: true },
        source: iframe.contentWindow,
      }))
    })

    expect(host.querySelector('.visualize-widget-actions')).toBeInstanceOf(HTMLDivElement)
    expect(host.querySelectorAll('.visualize-widget-action')).toHaveLength(2)
  })

  it('forwards widget sendPrompt messages to the host callback', async () => {
    const onSendPrompt = vi.fn()

    await act(async () => {
      root.render(
        <StreamVisualization
          title="Release readiness"
          code={finalCode}
          exportCode={finalCode}
          loadingMessage="Generating artifact"
          final
          onSendPrompt={onSendPrompt}
        />,
      )
    })

    const iframe = host.querySelector('iframe') as HTMLIFrameElement
    const widgetId = parseWidgetId(iframe)

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'visualize-widget:send-prompt',
          id: widgetId,
          prompt: 'Create a deployment checklist',
        },
        source: iframe.contentWindow,
      }))
    })

    expect(onSendPrompt).toHaveBeenCalledWith('Create a deployment checklist')
  })

  it('keeps non-renderable streamed content in loading state', async () => {
    await act(async () => {
      root.render(
        <StreamVisualization
          title="Partial artifact"
          code="<section"
          exportCode="<section"
          loadingMessage="Generating artifact"
          final={false}
        />,
      )
    })

    expect(host.querySelector('iframe')).toBeNull()
    expect(host.textContent).toContain('Generating artifact')
  })
})
