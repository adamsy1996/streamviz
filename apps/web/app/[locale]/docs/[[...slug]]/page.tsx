import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RenderDoc, renderDocMetadata } from '@/components/docs/render-doc'
import { sourceZh } from '@/lib/source'

export const dynamicParams = false

export function generateStaticParams() {
  return sourceZh.generateParams().map((item) => ({ locale: 'zh', ...item }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug?: string[] }> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (locale !== 'zh') return {}
  return renderDocMetadata('zh', slug)
}

export default async function LocalizedDocsRoute({ params }: { params: Promise<{ locale: string; slug?: string[] }> }) {
  const { locale, slug } = await params
  if (locale !== 'zh') notFound()
  return <RenderDoc locale="zh" slugs={slug} />
}
