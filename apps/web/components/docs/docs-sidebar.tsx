'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DocsSearch } from '@/components/docs/docs-search'
import { docsGroups, docsHref } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

export function DocsSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname().replace(/\/$/, '') || '/'
  return (
    <aside className="hidden px-5 py-8 lg:block">
      <DocsSearch locale={locale} />
      <nav className="sticky top-20 mt-7 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1" aria-label={locale === 'zh' ? '文档导航' : 'Documentation navigation'}>
        {docsGroups.map((group) => (
          <section className="mb-7" key={group.label}>
            <strong className="mb-2 block text-xs font-medium text-foreground">{locale === 'zh' ? group.labelZh : group.label}</strong>
            <div className="grid gap-0.5">
              {group.items.map((item) => {
                const href = docsHref(locale, item.slug)
                const active = pathname === href
                return <Link className={`rounded-md px-2 py-1.5 text-[13px] transition-colors ${active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`} key={href} href={href}>{locale === 'zh' ? item.titleZh : item.title}</Link>
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  )
}
