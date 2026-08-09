'use client'

import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { usePathname } from 'next/navigation'
import { DocsSearch } from '@/components/docs/docs-search'
import { docsGroups, docsHref } from '@/lib/docs-navigation'

export function DocsSidebar() {
  const pathname = usePathname().replace(/\/$/, '') || '/'
  return (
    <SideNav topContent={<DocsSearch />} resizable={{ defaultWidth: 256, minWidth: 220, maxWidth: 360, autoSaveId: 'streamviz-docs-nav' }}>
      {docsGroups.map(group => (
        <SideNavSection key={group.label} title={group.label}>
          {group.items.map(item => {
            const href = docsHref(item.slug)
            return <SideNavItem key={href} label={item.title} href={href} isSelected={pathname === href} />
          })}
        </SideNavSection>
      ))}
    </SideNav>
  )
}
