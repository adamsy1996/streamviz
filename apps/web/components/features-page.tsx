import Link from 'next/link'
import { ArrowRight, Bell, Braces, Clipboard, Download, FileCode2, MessageSquare, MousePointerClick, Palette, PanelsTopLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignalMark } from '@/components/signal-logo'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { pathFor, type Locale } from '@/lib/site'

const text = {
  en: {
    title: 'Built for streaming visual interfaces.',
    body: 'From incomplete HTML to a secure interactive artifact—without waiting for the final token.',
    architecture: 'Read the architecture', playground: 'Open playground', pipeline: 'Stream processing pipeline', live: 'Live artifact',
    pipelineLabels: [['HTML tokens', 'Tokens stream from the model'], ['Recover', 'Repair structure as it arrives'], ['Sanitize', 'Remove unsafe content and URLs'], ['Render', 'Update the document incrementally'], ['Enable interactions', 'Hydrate safe callbacks']],
    features: [
      ['Render before completion.', 'StreamViz repairs structure and releases meaningful visual content as soon as it can be rendered.'],
      ['Secure by construction.', 'Strict sanitization, CSP, and iframe isolation ensure that only safe, intended content can run.'],
      ['Host-controlled by design.', 'Apps keep control of themes, clipboard, exports, prompts, and notifications through typed callbacks.'],
    ],
    partial: 'Partial HTML (streaming)', preview: 'Live preview', security: 'Security boundary', untrusted: 'Untrusted HTML', sanitize: 'Sanitize', isolated: 'Isolated runtime', safe: 'Safe interactive artifact', host: 'Host application', runtime: 'StreamViz runtime',
    runtimeTitle: 'One runtime, every artifact.', runtimeBody: 'Charts, tables, dashboards, diagrams, forms, and purpose-built tools—streamed, secured, and interactive.',
  },
  zh: {
    title: '专为流式可视化界面构建。',
    body: '从尚未完成的 HTML 到安全可交互的产物——不必等待最后一个 token。',
    architecture: '阅读架构说明', playground: '打开体验场', pipeline: '流式处理流水线', live: '实时产物',
    pipelineLabels: [['HTML tokens', '模型持续输出 tokens'], ['恢复', '到达时修复结构'], ['净化', '移除不安全内容与 URL'], ['渲染', '增量更新 document'], ['启用交互', '接通安全 callback']],
    features: [
      ['在完成之前开始渲染。', 'StreamViz 会修复结构，并在视觉内容具备可渲染条件时立即释放。'],
      ['从结构上保证安全。', '严格净化、CSP 与 iframe 隔离确保只有安全且符合预期的内容可以运行。'],
      ['由宿主明确掌控。', '应用通过 typed callbacks 管理主题、剪贴板、导出、提示词与通知。'],
    ],
    partial: '部分 HTML（流式）', preview: '实时预览', security: '安全边界', untrusted: '不可信 HTML', sanitize: '净化', isolated: '隔离 runtime', safe: '安全可交互产物', host: '宿主应用', runtime: 'StreamViz runtime',
    runtimeTitle: '一个 runtime，承载每一种产物。', runtimeBody: '图表、表格、仪表盘、关系图、表单与专用工具——全部支持流式、安全与交互。',
  },
} as const

const pipelineIcons = [FileCode2, Braces, ShieldCheck, PanelsTopLeft, MousePointerClick]
const callbacks = [
  [Palette, 'Theme', 'colors, typography, radius'],
  [Clipboard, 'Copy', 'write to clipboard'],
  [Download, 'Export', 'HTML, PNG, SVG'],
  [MessageSquare, 'Prompt', 'open a follow-up'],
  [Bell, 'Notify', 'status and errors'],
] as const

function Pipeline({ locale }: { locale: Locale }) {
  const t = text[locale]
  return (
    <div className="features-pipeline">
      <header><strong>{t.pipeline}</strong><span><SignalMark />{t.live}</span></header>
      <div className="pipeline-stages">
        {t.pipelineLabels.map(([label, detail], index) => {
          const Icon = pipelineIcons[index]
          return <div key={label}><i><Icon /></i><strong>{label}</strong><p>{detail}</p><span /></div>
        })}
      </div>
      <div className="pipeline-resolution"><i /><span /><span /><span /><b /></div>
    </div>
  )
}

function PartialFeature({ locale }: { locale: Locale }) {
  const t = text[locale]
  return (
    <div className="feature-visual partial-feature">
      <div><strong>{t.partial}</strong><pre><code>{`<section class="cockpit">\n  <h3>Revenue cockpit</h3>\n  <div class="chart">\n    <svg viewBox="0 0 200 100">\n      <path d="M10 80 C40 60…" />\n    </svg>\n  </div>\n  <ul>\n    <li>$1.24M</li>\n    <li>$0.98M</li>\n    <li class="act`}</code><i /></pre><small><i />Streaming…</small></div>
      <ArrowRight />
      <div><strong>{t.preview}</strong><div className="mini-live-preview"><span>Revenue cockpit</span><svg viewBox="0 0 240 110"><path d="M8 94 C42 88 52 58 82 64 C116 70 126 38 158 46 C188 54 210 23 232 27" /></svg><b>$1.24M</b><b>$0.98M</b></div><small><i />Updates as tokens arrive</small></div>
    </div>
  )
}

function SecurityFeature({ locale }: { locale: Locale }) {
  const t = text[locale]
  return (
    <div className="feature-visual security-feature">
      <strong>{t.security}</strong>
      <div className="security-flow">
        <div><b>{t.untrusted}</b><code>&lt;script&gt;…&lt;/script&gt;</code><code>&lt;a href="javascript:…"&gt;</code><code>&lt;iframe src="…"&gt;</code></div>
        <ArrowRight />
        <div><b>{t.sanitize}</b><span>✓ Strip scripts & events</span><span>✓ Enforce URL policy</span><span>✓ Allowlist tags & attrs</span><span>✓ Rewrite external URLs</span></div>
        <ArrowRight />
        <div><b>{t.isolated}</b><ShieldCheck /><span>Sandboxed iframe</span><code>CSP: strict</code></div>
      </div>
      <p><i />{t.safe}</p>
    </div>
  )
}

function HostFeature({ locale }: { locale: Locale }) {
  const t = text[locale]
  return (
    <div className="feature-visual host-feature">
      <div><strong>{t.host}</strong>{callbacks.map(([Icon, label, detail]) => <span key={label}><Icon /><b>{label}</b><small>{detail}</small></span>)}</div>
      <i className="callback-bridge">Callbacks API</i>
      <div><strong>{t.runtime}</strong><div className="host-artifact"><span>{t.live}</span><svg viewBox="0 0 260 90"><path d="M8 76 C50 70 62 43 104 49 C146 55 164 25 206 34 C228 38 242 21 252 18" /></svg><button type="button">Export</button><button type="button">Copy</button></div></div>
    </div>
  )
}

const visuals = [PartialFeature, SecurityFeature, HostFeature]

export function FeaturesPage({ locale = 'en' }: { locale?: Locale }) {
  const t = text[locale]
  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="features-hero page-shell">
          <div><h1>{t.title}</h1><p>{t.body}</p><div className="hero-actions"><Button asChild size="lg"><Link href={pathFor(locale, '/docs/streaming-html')}>{t.architecture}</Link></Button><Button asChild size="lg" variant="outline"><Link href={pathFor(locale, '/playground')}>{t.playground}</Link></Button></div></div>
          <Pipeline locale={locale} />
          <div className="signal-rail" aria-hidden="true"><i /><span /><b /></div>
        </section>
        <section className="features-list page-shell">
          {t.features.map(([title, body], index) => {
            const Visual = visuals[index]
            return <article key={title}><div className="feature-copy"><span>0{index + 1}</span><h2>{title}</h2><p>{body}</p></div><Visual locale={locale} /></article>
          })}
        </section>
        <section className="features-runtime page-shell"><div><h2>{t.runtimeTitle}</h2><p>{t.runtimeBody}</p></div><Link href={pathFor(locale, '/docs/api-reference')}>{locale === 'zh' ? '查看 API' : 'Explore the API'}<ArrowRight /></Link></section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
