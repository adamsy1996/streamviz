'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { code as codeHighlighter } from '@streamdown/code'
import { Code2, FileCode2, LoaderCircle, Radio } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { StreamVisualization } from 'streamviz/react'
import { sequenceArtifact } from '@/lib/artifact-examples'

const sequenceDemoCode = `<style>svg[data-visualize-root]{height:420px!important}</style>\n${sequenceArtifact.code}`

const toolArguments = JSON.stringify({
  title: 'Agent conversation sequence diagram',
  loading_messages: [
    'Placing participants and lifelines',
    'Tracing the conversation flow',
    'Rendering the sequence diagram',
  ],
  widget_code: sequenceDemoCode,
})

const argumentChunks = toolArguments.match(/[\s\S]{1,180}/g) ?? []
const modelSseSource = [
  `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { role: 'assistant', content: null } }] })}`,
  `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: 'call_streamviz_sequence', type: 'function', function: { name: 'visualize_show_widget', arguments: '' } }] } }] })}`,
  ...argumentChunks.map((argumentsDelta) => `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: argumentsDelta } }] } }] })}`),
  `data: ${JSON.stringify({ id: 'chatcmpl_streamviz', object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] })}`,
  'data: [DONE]',
].join('\n\n')

function streamCompleteSvgNodes(code: string, progress: number) {
  const lines = code.trim().split('\n')
  const definitionsEnd = lines.findIndex((line) => line.includes('</defs>'))
  if (definitionsEnd < 0 || progress >= 100) return code

  const prefix = lines.slice(0, definitionsEnd + 1)
  const nodes = lines.slice(definitionsEnd + 1, -1)
  const visibleNodeCount = Math.max(1, Math.floor(nodes.length * progress / 100))
  return [...prefix, ...nodes.slice(0, visibleNodeCount), '</svg>'].join('\n')
}

export function HomeArtifactDemo({ locale = 'en' }: { locale?: 'en' | 'zh' }) {
  const [progress, setProgress] = useState(100)
  const [mounted, setMounted] = useState(false)
  const sseRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(100)
      return
    }
    const timer = window.setInterval(() => setProgress((value) => value >= 100 ? value : Math.min(100, value + 3)), 180)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress < 100) return undefined
    const timer = window.setTimeout(() => setProgress(32), 3200)
    return () => window.clearTimeout(timer)
  }, [progress])

  const code = useMemo(() => streamCompleteSvgNodes(sequenceDemoCode, progress), [progress])
  const source = modelSseSource.slice(0, Math.floor(modelSseSource.length * progress / 100))
  const htmlFragment = sequenceDemoCode.slice(0, Math.floor(sequenceDemoCode.length * progress / 100))
  const htmlMarkdown = `\`\`\`html\n${htmlFragment}\n\`\`\``
  const final = progress === 100
  const phase = progress < 43 ? 0 : progress < 76 ? 1 : 2
  const loadingMessages = locale === 'zh'
    ? ['正在放置参与者和生命线', '正在梳理对话调用链', '正在渲染时序图']
    : ['Placing participants and lifelines', 'Tracing the conversation flow', 'Rendering the sequence diagram']

  useEffect(() => {
    const node = sseRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [source])

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-[0_24px_80px_-40px_rgba(0,0,0,.45)]">
      <div className="flex h-10 items-center justify-between border-b bg-background/70 px-4">
        <div className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-destructive" /><i className="size-2 rounded-full bg-warning" /><i className="size-2 rounded-full bg-success" /></div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Agent response · live</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-success"><i className="size-1.5 rounded-full bg-success animate-pulse" />{final ? 'ready' : `${progress}%`}</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(300px,0.76fr)_minmax(320px,0.82fr)_minmax(500px,1.42fr)] lg:divide-x">
        <section className="min-w-0 border-b p-4 sm:p-5 lg:border-b-0 2xl:p-6">
          <div className="mb-4 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">01 · Raw model stream</span><span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">live connection</span></div>
          <div className="mb-3 flex items-center gap-2 text-xs"><Radio className="size-3.5 text-primary" /><strong className="font-medium">POST /v1/chat/completions</strong><span className="ml-auto font-mono text-[9px] text-muted-foreground">{Math.ceil(source.length / 1024)} KB</span></div>
          <div className="overflow-hidden rounded-lg border bg-[var(--slate-1)]">
            <div className="flex h-8 items-center justify-between border-b px-3 font-mono text-[9px] text-muted-foreground"><span className="inline-flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-success" />connected</span><span>text/event-stream</span></div>
            <div ref={sseRef} className="home-model-sse h-80 overflow-y-auto px-3 py-2.5 font-mono text-[10px] leading-[1.65]">
              <code>
                {source.split('\n').map((line, index) => (
                  <span key={`${index}-${line.slice(0, 12)}`} className={`block min-h-[1.65em] whitespace-pre-wrap break-all ${line.startsWith('data:') ? 'text-muted-foreground' : ''}`}>
                    {line.startsWith('data:') ? <><b className="font-medium text-primary">data:</b>{line.slice(5)}</> : line || ' '}
                  </span>
                ))}
                {!final ? <span className="inline-block h-[1.2em] w-px animate-pulse bg-primary align-middle" aria-hidden="true" /> : null}
              </code>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{locale === 'zh' ? '原始 SSE chunk 持续追加，完整保留模型协议。' : 'Raw SSE chunks append continuously, preserving the complete model protocol.'}</p>
        </section>

        <section className="min-w-0 border-b bg-background/45 p-4 sm:p-5 lg:border-b-0 2xl:p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">02 · StreamViz parser</div>
          <div className="grid gap-2">
            <div className="rounded-lg border bg-card p-2.5 shadow-surface-sm">
              <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground"><FileCode2 className="size-3" />title</span>
              <strong className="mt-1.5 block truncate text-xs font-medium">Agent conversation sequence diagram</strong>
            </div>
            <div className="rounded-lg border bg-card p-2.5 shadow-surface-sm">
              <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground"><LoaderCircle className={`size-3 ${final ? '' : 'animate-spin'}`} />loading_message</span>
              <strong className="mt-1.5 block truncate text-xs font-medium">{final ? (locale === 'zh' ? '渲染完成' : 'Render complete') : loadingMessages[phase]}</strong>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs"><Code2 className="size-3.5 text-primary" /><strong className="font-medium">widget_code</strong><span className="ml-auto font-mono text-[9px] text-muted-foreground">HTML · {Math.ceil(htmlFragment.length / 1024)} KB</span></div>
          <div className="home-html-output mt-2 h-64 overflow-auto rounded-lg">
            <Streamdown mode="streaming" isAnimating={!final} plugins={{ code: codeHighlighter }} controls={false} shikiTheme={['github-light', 'github-dark']} lineNumbers={false}>
              {htmlMarkdown}
            </Streamdown>
          </div>
        </section>

        <section className="min-w-0 bg-[var(--slate-1)] p-4 sm:p-5 2xl:p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">03 · Live render</div>
          <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-xs text-foreground">{locale === 'zh' ? '生成一张 Agent 对话系统时序图。' : 'Create an Agent conversation system sequence diagram.'}</div>
          <div className="mt-4 flex gap-3">
            <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border bg-card font-mono text-[9px] text-primary">AI</div>
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-xs leading-5 text-muted-foreground">{locale === 'zh' ? '正在生成系统时序图，节点会随模型输出逐步出现。' : 'Generating the system sequence. Nodes appear as the model streams them.'}</p>
              <div className="home-artifact-preview overflow-hidden rounded-xl border bg-card shadow-sm [&_.streamviz-root]:border-0 [&_.streamviz-root]:shadow-none">
                {mounted ? (
                  <StreamVisualization
                    title={locale === 'zh' ? sequenceArtifact.titleZh : sequenceArtifact.title}
                    code={code}
                    exportCode={sequenceDemoCode}
                    loadingMessage={locale === 'zh' ? '正在接收流式 HTML' : 'Receiving streamed HTML'}
                    final={final}
                    theme={{ mode: resolvedTheme === 'dark' ? 'dark' : 'light' }}
                  />
                ) : <div className="h-[420px]" aria-hidden="true" />}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
