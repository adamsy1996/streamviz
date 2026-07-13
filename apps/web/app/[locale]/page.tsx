import { notFound } from 'next/navigation'
import { HomePage } from '@/components/home-page'

export function generateStaticParams() {
  return [{ locale: 'zh' }]
}

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'zh') notFound()
  return <HomePage locale="zh" />
}
