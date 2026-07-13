'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DocsSearch } from '@/components/docs/docs-search'
import { docsGroups, docsHref } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

export function DocsSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname().replace(/\/$/, '') || '/'
  return (
    <aside className="docs-sidebar">
      <DocsSearch locale={locale} />
      <nav aria-label={locale === 'zh' ? '文档导航' : 'Documentation navigation'}>
        {docsGroups.map((group) => (
          <section key={group.label}>
            <strong>{locale === 'zh' ? group.labelZh : group.label}</strong>
            <div>
              {group.items.map((item) => {
                const href = docsHref(locale, item.slug)
                const active = pathname === href
                return <Link className={active ? 'is-active' : ''} key={href} href={href}>{locale === 'zh' ? item.titleZh : item.title}</Link>
              })}
            </div>
          </section>
        ))}
      </nav>
      <i className="docs-sidebar-signal" aria-hidden="true" />
    </aside>
  )
}
