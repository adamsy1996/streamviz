'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Check, ChevronDown, ChevronUp, Copy, Download, Pause, Play, RotateCcw } from 'lucide-react'
import { StreamVisualization } from 'streamviz/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { artifactExamples } from '@/lib/artifact-examples'
import type { Locale } from '@/lib/site'

type EventItem = { id: number; name: string; detail: string; time: string }

const ui = {
  en: {
    title: 'StreamViz Playground', subtitle: 'Stream HTML. Inspect every state. Ship the artifact.', example: 'Example', speed: 'Speed', reset: 'Reset', simulate: 'Simulate stream', pause: 'Pause stream', resume: 'Resume stream', html: 'HTML stream', artifact: 'Generated artifact',
    steps: [['partial', '01', 'Partial HTML', 'Receiving streamed tokens'], ['renderable', '02', 'Renderable UI', 'Valid HTML structure'], ['interactive', '03', 'Interactive result', 'Live updates & events']],
    receiving: 'Receiving streamed HTML', complete: 'HTML stream complete', sandbox: 'Sandbox: isolated', render: 'Render time', events: 'Host events', emptyEvents: 'No host events yet.', copy: 'Copy HTML', copied: 'Copied', export: 'Export HTML',
  },
  zh: {
    title: 'StreamViz 体验场', subtitle: '流式接收 HTML，检查每个状态，交付最终产物。', example: '示例', speed: '速度', reset: '重置', simulate: '模拟流式生成', pause: '暂停', resume: '继续', html: 'HTML 数据流', artifact: '生成的可视化产物',
    steps: [['partial', '01', '部分 HTML', '正在接收流式 tokens'], ['renderable', '02', '可渲染界面', 'HTML 结构已可用'], ['interactive', '03', '可交互结果', '实时更新与事件']],
    receiving: '正在接收流式 HTML', complete: 'HTML 数据流已完成', sandbox: 'Sandbox：已隔离', render: '渲染耗时', events: '宿主事件', emptyEvents: '暂时没有宿主事件。', copy: '复制 HTML', copied: '已复制', export: '导出 HTML',
  },
} as const

const progressByStage = { partial: 22, renderable: 67, interactive: 100 } as const

function clock() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

export function PlaygroundWorkbench({ locale = 'en' }: { locale?: Locale }) {
  const t = ui[locale]
  const { resolvedTheme } = useTheme()
  const [e2eMode, setE2eMode] = useState(false)
  const [exampleId, setExampleId] = useState('revenue')
  const [speed, setSpeed] = useState('1')
  const [progress, setProgress] = useState(67)
  const [playing, setPlaying] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [events, setEvents] = useState<EventItem[]>([
    { id: 1, name: 'onRender', detail: 'Renderable HTML boundary released', time: '14:21:08' },
    { id: 2, name: 'onTheme', detail: 'Host theme synchronized', time: '14:21:09' },
  ])
  const nextEventId = useRef(3)

  const example = artifactExamples.find((item) => item.id === exampleId) || artifactExamples[0]
  const activeCode = useMemo(() => e2eMode ? example.code.replace('</script>', `;setTimeout(()=>sendPrompt('Browser e2e prompt'),120);</script>`) : example.code, [e2eMode, example])
  const code = useMemo(() => activeCode.slice(0, Math.max(1, Math.floor(activeCode.length * progress / 100))), [activeCode, progress])
  const lines = useMemo(() => code.split('\n'), [code])
  const stage = progress >= 100 ? 'interactive' : progress >= 34 ? 'renderable' : 'partial'

  const addEvent = useCallback((name: string, detail: string) => {
    const id = nextEventId.current
    nextEventId.current += 1
    setEvents((current) => [{ id, name, detail, time: clock() }, ...current].slice(0, 8))
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('e2e') !== '1') return
    setE2eMode(true)
    setProgress(100)
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing) return undefined
    const increment = Number(speed) * 1.35
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + increment)
        if (next >= 100) {
          window.setTimeout(() => {
            setPlaying(false)
            addEvent('onRender', 'Interactive artifact finalized')
          }, 0)
        }
        return next
      })
    }, 90)
    return () => window.clearInterval(timer)
  }, [addEvent, playing, speed])

  const start = () => {
    setProgress(1)
    setPlaying(true)
    setEvents([])
    addEvent('onStreamStart', `Streaming ${example.title}`)
  }

  const reset = () => {
    setPlaying(false)
    setProgress(0)
    setEvents([])
  }

  const chooseStage = (value: string) => {
    if (!(value in progressByStage)) return
    setPlaying(false)
    setProgress(progressByStage[value as keyof typeof progressByStage])
    addEvent('onStageChange', `Selected ${value} state`)
  }

  const chooseExample = (value: string) => {
    setExampleId(value)
    setPlaying(false)
    setProgress(67)
    const selected = artifactExamples.find((item) => item.id === value)
    if (selected) addEvent('onExampleChange', `Loaded ${selected.title}`)
  }

  const copyHtml = async () => {
    setCopied(true)
    try {
      await navigator.clipboard.writeText(example.code)
    } catch {
      const field = document.createElement('textarea')
      field.value = example.code
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    addEvent('onCopy', 'Artifact HTML copied')
    window.setTimeout(() => setCopied(false), 1400)
  }

  const exportHtml = () => {
    const blob = new Blob([example.code], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${example.id}.html`
    link.click()
    URL.revokeObjectURL(url)
    addEvent('onExport', `Exported ${example.id}.html`)
  }

  return (
    <main className="playground-page">
      <section className="playground-toolbar page-shell">
        <div><h1>{t.title}</h1><p>{t.subtitle}</p></div>
        <div className="playground-controls">
          <label><span>{t.example}</span><Select value={exampleId} onValueChange={chooseExample}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent position="popper"><SelectGroup><SelectLabel>{t.example}</SelectLabel>{artifactExamples.map((item) => <SelectItem key={item.id} value={item.id}>{locale === 'zh' ? item.titleZh : item.title}</SelectItem>)}</SelectGroup></SelectContent></Select></label>
          <label><span>{t.speed}</span><Select value={speed} onValueChange={setSpeed}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent position="popper"><SelectGroup><SelectLabel>{t.speed}</SelectLabel>{['0.5', '1', '2'].map((item) => <SelectItem key={item} value={item}>{item}×</SelectItem>)}</SelectGroup></SelectContent></Select></label>
          <Button variant="outline" onClick={reset}><RotateCcw data-icon="inline-start" />{t.reset}</Button>
          <Button onClick={start}><Play data-icon="inline-start" />{t.simulate}</Button>
        </div>
      </section>

      <section className="playground-stage page-shell">
        <Tabs value={stage} onValueChange={chooseStage}>
          <TabsList aria-label="Streaming phases">
            {t.steps.map(([value, number, label, detail]) => <TabsTrigger key={value} value={value}><i>{number}</i><span><b>{label}</b><small>{detail}</small></span></TabsTrigger>)}
          </TabsList>
        </Tabs>
      </section>

      <section className="playground-workbench page-shell">
        <div className="code-workbench">
          <header><strong>{t.html}</strong><div><Button variant="ghost" size="icon-sm" onClick={() => setPlaying((value) => !value)} aria-label={playing ? t.pause : t.resume}>{playing ? <Pause /> : <Play />}</Button><Button variant="ghost" size="icon-sm" onClick={copyHtml} aria-label={t.copy}>{copied ? <Check /> : <Copy />}</Button><Button variant="ghost" size="icon-sm" onClick={exportHtml} aria-label={t.export}><Download /></Button></div></header>
          <ol aria-label={t.html}>{lines.map((line, index) => <li key={`${index}-${line.slice(0, 12)}`}><span>{index + 1}</span><code>{line || ' '}</code>{index === lines.length - 1 && progress < 100 ? <i /> : null}</li>)}</ol>
          <footer><span><i className={progress === 100 ? 'is-complete' : ''} />{progress === 100 ? t.complete : t.receiving}</span><code>Ln {lines.length}, Col {lines.at(-1)?.length || 0}</code><b>HTML</b></footer>
        </div>

        <div className="artifact-workbench">
          <header><strong>{locale === 'zh' ? example.titleZh : example.title}</strong><span><i />{stage === 'interactive' ? (locale === 'zh' ? '可交互' : 'Interactive') : (locale === 'zh' ? '生成中' : 'Streaming')}</span><em>{t.artifact}</em></header>
          <div className="artifact-runtime">
            <StreamVisualization
              title={locale === 'zh' ? example.titleZh : example.title}
              code={code}
              exportCode={activeCode}
              loadingMessage={t.receiving}
              loadingMessages={locale === 'zh' ? ['正在接收流式 HTML', '正在恢复可渲染结构', '正在启用交互'] : ['Receiving streamed HTML', 'Recovering renderable structure', 'Enabling interactions']}
              final={progress === 100}
              theme={{ mode: resolvedTheme === 'dark' ? 'dark' : 'light' }}
              onSendPrompt={(prompt: string) => addEvent('onPrompt', prompt)}
              notify={(message: string, variant: 'success' | 'error') => addEvent(`onNotify:${variant}`, message)}
            />
          </div>
          <footer><span><i />{t.sandbox}</span><span>{t.render}: <b>{Math.max(42, Math.round(progress * 1.28))}ms</b></span><span>{t.events}: <b>{events.length}</b></span></footer>
        </div>
      </section>

      <section className={`event-console page-shell ${eventsOpen ? 'is-open' : ''}`}>
        <button type="button" onClick={() => setEventsOpen((value) => !value)} aria-expanded={eventsOpen}><span>{eventsOpen ? <ChevronDown /> : <ChevronUp />}{t.events}</span><b>{events.length}</b></button>
        {eventsOpen ? <div>{events.length ? events.map((event) => <p key={event.id}><time>{event.time}</time><strong>{event.name}</strong><span>{event.detail}</span></p>) : <p className="empty-event">{t.emptyEvents}</p>}</div> : null}
      </section>
      <p className="sr-only" aria-live="polite">{stage}</p>
    </main>
  )
}
