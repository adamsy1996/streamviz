'use client'

import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { usePathname } from 'next/navigation'
import { DocsSearch } from '@/components/docs/docs-search'
import { docsGroups, docsHref } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

export function DocsSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname().replace(/\/$/, '') || '/'
  return (
    <SideNav topContent={<DocsSearch locale={locale} />} resizable={{ defaultWidth: 256, minWidth: 220, maxWidth: 360, autoSaveId: 'streamviz-docs-nav' }}>
      {docsGroups.map(group => (
        <SideNavSection key={group.label} title={locale === 'zh' ? group.labelZh : group.label}>
          {group.items.map(item => {
            const href = docsHref(locale, item.slug)
            return <SideNavItem key={href} label={locale === 'zh' ? item.titleZh : item.title} href={href} isSelected={pathname === href} />
          })}
        </SideNavSection>
      ))}
    </SideNav>
  )
}
