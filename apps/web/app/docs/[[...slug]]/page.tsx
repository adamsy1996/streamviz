import type { Metadata } from 'next'
import { RenderDoc, renderDocMetadata } from '@/components/docs/render-doc'
import { docsSource } from '@/lib/source'

export const dynamicParams = false

export function generateStaticParams() {
  return docsSource.generateParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  return renderDocMetadata(slug)
}

export default async function DocsRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return <RenderDoc slugs={slug} />
}
