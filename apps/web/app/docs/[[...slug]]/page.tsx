import type { Metadata } from 'next'
import { RenderDoc, renderDocMetadata } from '@/components/docs/render-doc'
import { sourceEn } from '@/lib/source'

export const dynamicParams = false

export function generateStaticParams() {
  return sourceEn.generateParams()
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  return renderDocMetadata('en', slug)
}

export default async function DocsRoute({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return <RenderDoc locale="en" slugs={slug} />
}
