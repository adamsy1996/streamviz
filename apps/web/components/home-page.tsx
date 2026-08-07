import Link from 'next/link'
import { ArrowRight, CircleCheck, Code2, GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeArtifactDemo } from '@/components/home-artifact-demo'
import { InstallCommand } from '@/components/install-command'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { pathFor, type Locale } from '@/lib/site'

const copy = {
  en: {
    eyebrow: 'Open-source streaming UI runtime',
    title: 'Turn model output into live interfaces.',
    body: 'StreamViz recovers partial model-generated HTML, isolates it safely, and renders interactive visualizations inside your React conversation—before generation finishes.',
    primary: 'Get started',
    secondary: 'View on GitHub',
    demoLabel: 'One stream. Three visible stages.',
    demoBody: 'Watch a function call become an interactive artifact without hiding the model-to-interface boundary.',
    proof: ['React 19 ready', 'Secure iframe boundary', 'Partial HTML recovery'],
    benefitsTitle: 'The missing runtime between tokens and UI.',
    benefits: [
      ['Render during generation', 'Recover useful structure from incomplete HTML and update the same artifact as new tokens arrive.'],
      ['Secure by default', 'Sanitize generated markup and execute each artifact inside a restrictive iframe sandbox.'],
      ['Host-controlled', 'Keep themes, exports, clipboard, prompts, and notifications inside your application boundary.'],
    ],
    installTitle: 'Add streaming artifacts to your agent.',
    installBody: 'Install the package, pass the accumulated code, and mark the final chunk. StreamViz handles the unstable middle.',
    readApi: 'Read the React API',
  },
  zh: {
    eyebrow: '开源的流式 UI runtime',
    title: '把模型输出，变成实时可交互界面。',
    body: 'StreamViz 在生成结束前恢复不完整 HTML、安全隔离执行，并把实时可视化直接渲染在 React 对话流里。',
    primary: '开始使用',
    secondary: '查看 GitHub',
    demoLabel: '一条流，三个可见阶段。',
    demoBody: '清楚展示 function call 如何经过 StreamViz，成为对话中的交互式产物。',
    proof: ['支持 React 19', '安全 iframe 边界', '不完整 HTML 恢复'],
    benefitsTitle: '补上 tokens 与 UI 之间缺失的 runtime。',
    benefits: [
      ['生成时就开始渲染', '从不完整 HTML 中恢复可用结构，并随新 token 到达更新同一个产物。'],
      ['默认安全', '净化生成内容，并在受限 iframe sandbox 中执行每个产物。'],
      ['宿主完全可控', '主题、导出、剪贴板、提示词和通知都留在你的应用边界内。'],
    ],
    installTitle: '给你的 Agent 加上流式可视化。',
    installBody: '安装 package、传入累积代码并标记最终分片；不稳定的中间状态交给 StreamViz。',
    readApi: '查看 React API',
  },
} as const

export function HomePage({ locale = 'en' }: { locale?: Locale }) {
  const t = copy[locale]

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="overflow-hidden">
        <section className="relative border-b">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,var(--indigo-4),transparent_42%)] opacity-70 dark:opacity-35" />
          <div className="relative w-full px-page pb-16 pt-20 sm:pb-20 sm:pt-28 lg:pb-24">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground shadow-sm">
                <span className="size-1.5 rounded-full bg-success shadow-[0_0_0_4px_var(--jade-4)]" />
                {t.eyebrow}
              </p>
              <h1 className="text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
                {t.title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
                {t.body}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg"><Link href={pathFor(locale, '/docs/getting-started')}>{t.primary}<ArrowRight /></Link></Button>
                <Button asChild variant="outline" size="lg"><a href="https://github.com/adamsy1996/streamviz"><GitFork />{t.secondary}</a></Button>
              </div>
              <InstallCommand locale={locale} className="mx-auto mt-5 max-w-sm text-left" />
              <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {t.proof.map((item) => <span key={item} className="inline-flex items-center gap-1.5"><CircleCheck className="size-3.5 text-success" />{item}</span>)}
              </div>
            </div>

            <div className="mt-16 w-full sm:mt-20">
              <div className="mb-6 grid gap-2 sm:grid-cols-2 sm:items-end xl:grid-cols-[minmax(340px,0.8fr)_minmax(260px,0.42fr)_minmax(560px,1.28fr)]">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{t.demoLabel}</h2>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:justify-self-end sm:text-right xl:col-start-3">{t.demoBody}</p>
              </div>
              <HomeArtifactDemo locale={locale} />
            </div>
          </div>
        </section>

        <section className="w-full px-page py-20 sm:py-24">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary">Why StreamViz</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{t.benefitsTitle}</h2>
          </div>
          <div className="mt-10 grid border-y md:grid-cols-3 md:divide-x">
            {t.benefits.map(([title, body], index) => (
              <article key={title} className="border-b py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0 xl:px-10">
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                <h3 className="mt-7 text-lg font-medium tracking-tight">{title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="grid w-full gap-10 px-page py-16 sm:py-20 lg:grid-cols-[minmax(0,0.75fr)_minmax(560px,1.25fr)] lg:items-center xl:gap-16">
            <div className="max-w-2xl">
              <div className="mb-4 grid size-9 place-items-center rounded-lg border bg-background text-primary shadow-sm"><Code2 className="size-4" /></div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em]">{t.installTitle}</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{t.installBody}</p>
              <Button asChild variant="link" className="mt-5 h-auto px-0"><Link href={pathFor(locale, '/docs/api-reference')}>{t.readApi}<ArrowRight /></Link></Button>
            </div>
            <div className="rounded-xl border bg-background p-2 shadow-sm">
              <div className="flex items-center gap-1.5 border-b px-3 py-2"><i className="size-2 rounded-full bg-destructive" /><i className="size-2 rounded-full bg-warning" /><i className="size-2 rounded-full bg-success" /><span className="ml-2 font-mono text-[10px] text-muted-foreground">app.tsx</span></div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-muted-foreground"><code><span className="text-primary">import</span> {'{ StreamVisualization }'} <span className="text-primary">from</span> <span className="text-success">&apos;streamviz/react&apos;</span>{'\n\n'}<span className="text-primary">return</span> {'<StreamVisualization\n  code={streamedHtml}\n  final={isComplete}\n/>'}</code></pre>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
