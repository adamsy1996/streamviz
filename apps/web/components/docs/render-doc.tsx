import { notFound } from 'next/navigation'
import { DocsPage } from '@/components/docs/docs-page'
import { getMDXComponents } from '@/mdx-components'
import { docsSource } from '@/lib/source'

export function renderDocMetadata(slugs?: string[]) {
  const page = docsSource.getPage(slugs)
  if (!page) return {}
  return { title: page.data.title, description: page.data.description }
}

export function RenderDoc({ slugs }: { slugs?: string[] }) {
  const page = docsSource.getPage(slugs)
  if (!page) notFound()
  const Mdx = page.data.body
  return (
    <DocsPage
      title={page.data.title}
      description={page.data.description}
      toc={page.data.toc}
      slug={slugs?.join('/') || ''}
    >
      <Mdx components={getMDXComponents()} />
    </DocsPage>
  )
}
