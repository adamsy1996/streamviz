'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { code as codeHighlighter } from '@streamdown/code'
import { Check, Code2, Lock, WandSparkles } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { StreamVisualization } from 'streamviz/react'
import { sequenceArtifact } from '@/lib/artifact-examples'

const sequenceDemoCode = `<style>svg[data-visualize-root]{height:clamp(400px,55vw,520px)!important}</style>\n${sequenceArtifact.code}`

const streamSource = JSON.stringify({
  type: 'function_call',
  call_id: 'call_streamviz_sequence',
  name: 'visualize_show_widget',
  arguments: {
    title: 'Agent conversation sequence diagram',
    loading_messages: [
      'Placing participants and lifelines',
      'Tracing the conversation flow',
      'Rendering the sequence diagram',
    ],
    widget_code: sequenceDemoCode,
  },
}, null, 2)

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
  const [progress, setProgress] = useState(44)
  const { resolvedTheme } = useTheme()

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
    const timer = window.setTimeout(() => setProgress(44), 3200)
    return () => window.clearTimeout(timer)
  }, [progress])

  const code = useMemo(() => streamCompleteSvgNodes(sequenceDemoCode, progress), [progress])
  const source = streamSource.slice(0, Math.floor(streamSource.length * progress / 100))
  const sourceMarkdown = `\`\`\`json\n${source}\n\`\`\``
  const final = progress === 100
  const phase = progress < 43 ? 0 : progress < 76 ? 1 : 2
  const stages = locale === 'zh'
    ? [['恢复', '补全流式结构'], ['隔离', '净化并写入 iframe'], ['渲染', '原位更新产物']]
    : [['Recover', 'Complete partial structure'], ['Isolate', 'Sanitize into an iframe'], ['Render', 'Update the artifact in place']]
  const icons = [WandSparkles, Lock, Code2]

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-[0_24px_80px_-40px_rgba(0,0,0,.45)]">
      <div className="flex h-10 items-center justify-between border-b bg-background/70 px-4">
        <div className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-destructive" /><i className="size-2 rounded-full bg-warning" /><i className="size-2 rounded-full bg-success" /></div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Agent response · live</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-success"><i className="size-1.5 rounded-full bg-success animate-pulse" />{final ? 'ready' : `${progress}%`}</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(300px,0.8fr)_minmax(230px,0.42fr)_minmax(420px,1.28fr)] lg:divide-x">
        <section className="min-w-0 border-b p-4 sm:p-5 lg:border-b-0 2xl:p-6">
          <div className="mb-4 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">01 · Model stream</span><span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">raw function_call</span></div>
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs"><Code2 className="size-3.5 text-primary" /><strong className="font-medium">visualize_show_widget</strong><span className="ml-auto font-mono text-[9px] text-muted-foreground">{Math.ceil(source.length / 1024)} KB</span></div>
            <div className="home-tool-output max-h-[360px] min-h-72 overflow-auto rounded-lg">
              <Streamdown
                mode="streaming"
                isAnimating={!final}
                plugins={{ code: codeHighlighter }}
                controls={false}
                shikiTheme={['github-light', 'github-dark']}
                lineNumbers={false}
              >
                {sourceMarkdown}
              </Streamdown>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{locale === 'zh' ? '模型持续输出 widget_code；宿主不需要等待完整 JSON。' : 'The model keeps appending widget_code; the host does not wait for complete JSON.'}</p>
        </section>

        <section className="min-w-0 border-b bg-background/45 p-4 sm:p-5 lg:border-b-0 2xl:p-6">
          <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">02 · StreamViz</div>
          <div className="relative grid gap-3 before:absolute before:bottom-8 before:left-[17px] before:top-8 before:w-px before:bg-border">
            {stages.map(([name, description], index) => {
              const Icon = icons[index]
              const active = phase >= index
              return (
                <div key={name} className={`relative z-10 flex gap-3 rounded-lg border p-3 transition-colors ${active ? 'bg-card shadow-sm' : 'bg-background/70 opacity-55'}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-md border ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{phase > index ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                  <span className="min-w-0"><strong className="block text-xs font-medium">{name}</strong><small className="mt-1 block text-[10px] leading-4 text-muted-foreground">{description}</small></span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 rounded-lg border border-dashed p-3 font-mono text-[9px] leading-4 text-muted-foreground">partial HTML → safe document → interactive artifact</div>
        </section>

        <section className="min-w-0 bg-[var(--slate-1)] p-4 sm:p-5 2xl:p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">03 · Conversation UI</div>
          <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-xs text-foreground">{locale === 'zh' ? '生成一张 Agent 对话系统时序图。' : 'Create an Agent conversation system sequence diagram.'}</div>
          <div className="mt-4 flex gap-3">
            <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border bg-card font-mono text-[9px] text-primary">AI</div>
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-xs leading-5 text-muted-foreground">{locale === 'zh' ? '正在生成系统时序图，节点会随模型输出逐步出现。' : 'Generating the system sequence. Nodes appear as the model streams them.'}</p>
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm [&_.streamviz-root]:border-0 [&_.streamviz-root]:shadow-none">
                <StreamVisualization
                  title={locale === 'zh' ? sequenceArtifact.titleZh : sequenceArtifact.title}
                  code={code}
                  exportCode={sequenceDemoCode}
                  loadingMessage={locale === 'zh' ? '正在接收流式 HTML' : 'Receiving streamed HTML'}
                  final={final}
                  theme={{ mode: resolvedTheme === 'dark' ? 'dark' : 'light' }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
