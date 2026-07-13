import Link from 'next/link'
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeArtifactDemo } from '@/components/home-artifact-demo'
import { InstallCommand } from '@/components/install-command'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { pathFor, type Locale } from '@/lib/site'

const copy = {
  en: {
    title: 'Streaming visual artifacts for AI agents.',
    body: 'Turn AI-generated HTML into live dashboards, charts, diagrams, and interactive tools—while the response is still being generated.',
    primary: 'Read the docs', secondary: 'Open playground',
    capabilities: 'Built for AI-native interfaces.',
    capabilityBody: 'A rendering boundary designed for incomplete model output, secure execution, and explicit application control.',
    features: [
      ['Render while the model thinks.', 'Recover useful UI from partial HTML and upgrade it in place as tokens arrive.'],
      ['Secure by construction.', 'Sanitize streamed content and isolate every artifact inside a restrictive iframe runtime.'],
      ['Host-controlled by design.', 'Keep themes, clipboard, exports, prompts, and notifications inside your application boundary.'],
    ],
    workflow: 'From model output to live interface.',
    workflowBody: 'One package covers partial recovery, iframe rendering, final interaction, export, and host callbacks.',
    stepLabels: ['HTML tokens', 'Recover', 'Sanitize', 'Render', 'Interact'],
    start: 'Start building',
  },
  zh: {
    title: '为 AI Agent 流式生成可视化界面。',
    body: '在回答仍在生成时，把模型输出的 HTML 转化为实时仪表盘、图表、关系图和可交互工具。',
    primary: '阅读文档', secondary: '打开体验场',
    capabilities: '专为 AI 原生界面而设计。',
    capabilityBody: '一条为不完整模型输出、安全执行和应用显式控制而设计的渲染边界。',
    features: [
      ['模型思考时，界面已经开始渲染。', '从部分 HTML 中恢复可用界面，并随着 token 到达原位升级。'],
      ['从结构上保证安全。', '净化流式内容，并把每个产物隔离在严格的 iframe runtime 中。'],
      ['由宿主明确掌控。', '主题、剪贴板、导出、提示词和通知都留在应用边界内。'],
    ],
    workflow: '从模型输出到实时界面。',
    workflowBody: '一个 package 覆盖部分恢复、iframe 渲染、最终交互、导出与宿主回调。',
    stepLabels: ['HTML tokens', '恢复', '净化', '渲染', '交互'],
    start: '开始构建',
  },
} as const

const featureIcons = [Sparkles, ShieldCheck, Workflow]

export function HomePage({ locale = 'en' }: { locale?: Locale }) {
  const t = copy[locale]
  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="home-hero page-shell">
          <div className="home-hero-copy">
            <h1>{t.title}</h1>
            <p>{t.body}</p>
            <div className="hero-actions">
              <Button asChild size="lg"><Link href={pathFor(locale, '/docs')}>{t.primary}<ArrowRight data-icon="inline-end" /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href={pathFor(locale, '/playground')}>{t.secondary}</Link></Button>
            </div>
            <InstallCommand locale={locale} />
          </div>
          <HomeArtifactDemo locale={locale} />
          <div className="signal-rail" aria-hidden="true"><i /><span /><b /></div>
        </section>

        <section className="home-capabilities page-shell">
          <header className="section-heading">
            <h2>{t.capabilities}</h2>
            <p>{t.capabilityBody}</p>
          </header>
          <div className="capability-rows">
            {t.features.map(([title, body], index) => {
              const Icon = featureIcons[index]
              return (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <Icon />
                  <div><h3>{title}</h3><p>{body}</p></div>
                  <Link href={pathFor(locale, '/features')} aria-label={title}><ArrowRight /></Link>
                </article>
              )
            })}
          </div>
        </section>

        <section className="home-workflow page-shell">
          <div>
            <h2>{t.workflow}</h2>
            <p>{t.workflowBody}</p>
            <Button asChild variant="outline"><Link href={pathFor(locale, '/docs/getting-started')}>{t.start}<ArrowRight data-icon="inline-end" /></Link></Button>
          </div>
          <div className="workflow-pipeline">
            {t.stepLabels.map((label, index) => <span key={label}><i>{index + 1}</i><b>{label}</b></span>)}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
