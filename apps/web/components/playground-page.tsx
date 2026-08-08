import { PlaygroundWorkbench } from '@/components/playground/playground-workbench'
import { SiteFrame } from '@/components/site-frame'
import type { Locale } from '@/lib/site'

export function PlaygroundPage({ locale = 'en' }: { locale?: Locale }) {
  return <SiteFrame locale={locale} height="fill"><PlaygroundWorkbench locale={locale} /></SiteFrame>
}
