import { SiteHeader } from '@/components/site-header'
import { PlaygroundWorkbench } from '@/components/playground/playground-workbench'
import type { Locale } from '@/lib/site'

export function PlaygroundPage({ locale = 'en' }: { locale?: Locale }) {
  return <><SiteHeader locale={locale} /><PlaygroundWorkbench locale={locale} /></>
}
