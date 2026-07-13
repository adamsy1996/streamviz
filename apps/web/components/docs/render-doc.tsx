import { notFound } from 'next/navigation'
import { DocsPage } from '@/components/docs/docs-page'
import { getMDXComponents } from '@/mdx-components'
import { docsSource } from '@/lib/source'
import type { Locale } from '@/lib/site'

export function renderDocMetadata(locale: Locale, slugs?: string[]) {
  const page = docsSource(locale).getPage(slugs)
  if (!page) return {}
  return { title: page.data.title, description: page.data.description }
}

export function RenderDoc({ locale, slugs }: { locale: Locale; slugs?: string[] }) {
  const page = docsSource(locale).getPage(slugs)
  if (!page) notFound()
  const Mdx = page.data.body
  return (
    <DocsPage
      locale={locale}
      title={page.data.title}
      description={page.data.description}
      toc={page.data.toc}
      slug={slugs?.join('/') || ''}
    >
      <Mdx components={getMDXComponents()} />
    </DocsPage>
  )
}
