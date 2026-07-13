import { notFound } from 'next/navigation'
import { PlaygroundPage } from '@/components/playground-page'

export function generateStaticParams() { return [{ locale: 'zh' }] }

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'zh') notFound()
  return <PlaygroundPage locale="zh" />
}
