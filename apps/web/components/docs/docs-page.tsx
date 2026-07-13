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
      <div className="docs-layout">
        <DocsSidebar locale={locale} />
        <main className="docs-main">
          <header className="docs-article-header">
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </header>
          <article className="docs-prose">{children}</article>
          <nav className="docs-pagination" aria-label={locale === 'zh' ? '文档分页' : 'Documentation pagination'}>
            {previous ? <Link href={previous.href}><ArrowLeft /><span><small>{locale === 'zh' ? '上一页' : 'Previous'}</small>{previous.title}</span></Link> : <span />}
            {next ? <Link href={next.href}><span><small>{locale === 'zh' ? '下一页' : 'Next'}</small>{next.title}</span><ArrowRight /></Link> : null}
          </nav>
        </main>
        <DocsToc items={toc} locale={locale} />
      </div>
    </>
  )
}
