import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { DocsToc } from '@/components/docs/docs-toc'
import { SiteHeader } from '@/components/site-header'
import { flatDocs } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

type TocItem = { title: ReactNode; url: string; depth: number }

export function DocsPage({ locale, title, description, toc, slug, children }: { locale: Locale; title: string; description?: string; toc: TocItem[]; slug: string; children: ReactNode }) {
  const pages = flatDocs(locale)
  const index = pages.findIndex((page) => page.slug === slug)
  const previous = index > 0 ? pages[index - 1] : null
  const next = index >= 0 && index < pages.length - 1 ? pages[index + 1] : null

  return (
    <>
      <SiteHeader locale={locale} />
      <div className="grid min-h-[calc(100vh-3.5rem)] w-full lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_210px]">
        <DocsSidebar locale={locale} />
        <main className="min-w-0 border-x-0 px-4 py-10 sm:px-8 sm:py-14 lg:border-l lg:px-12 xl:px-16 2xl:px-20">
          <div className="mx-auto w-full max-w-4xl">
            <header className="mb-10 border-b pb-8">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">StreamViz documentation</p>
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{title}</h1>
              {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
            </header>
            <article className="docs-prose max-w-3xl">{children}</article>
            <nav className="mt-16 grid gap-3 border-t pt-6 sm:grid-cols-2" aria-label={locale === 'zh' ? '文档分页' : 'Documentation pagination'}>
              {previous ? <Link className="group flex min-h-20 items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted" href={previous.href}><ArrowLeft className="text-muted-foreground transition-transform group-hover:-translate-x-0.5" /><span><small className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{locale === 'zh' ? '上一页' : 'Previous'}</small><b className="mt-1 block text-sm font-medium">{previous.title}</b></span></Link> : <span />}
              {next ? <Link className="group flex min-h-20 items-center justify-end gap-3 rounded-lg border bg-card px-4 py-3 text-right transition-colors hover:bg-muted" href={next.href}><span><small className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{locale === 'zh' ? '下一页' : 'Next'}</small><b className="mt-1 block text-sm font-medium">{next.title}</b></span><ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-0.5" /></Link> : null}
            </nav>
          </div>
        </main>
        <DocsToc items={toc} locale={locale} />
      </div>
    </>
  )
}
