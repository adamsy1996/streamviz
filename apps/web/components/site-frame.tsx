'use client'

import { AppShell } from '@astryxdesign/core/AppShell'
import { MobileNav } from '@astryxdesign/core/MobileNav'
import { SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { siteCopy } from '@/lib/site'

export function SiteFrame({ children, sideNav, height = 'auto', useSideNavOnMobile = false }: { children: ReactNode; sideNav?: ReactNode; height?: 'auto' | 'fill'; useSideNavOnMobile?: boolean }) {
  const pathname = usePathname()
  const copy = siteCopy
  const links = [
    { href: '/', label: copy.nav.home },
    { href: '/docs', label: copy.nav.docs },
    { href: '/playground', label: copy.nav.playground },
  ]

  return (
    <AppShell
      topNav={<SiteHeader />}
      sideNav={sideNav}
      contentPadding={0}
      height={height}
      variant="section"
      mobileNav={useSideNavOnMobile ? {} : {
        content: (
          <MobileNav header="StreamViz" label={copy.menu}>
            <SideNavSection title="Navigation">
              {links.map(item => <SideNavItem key={item.href} label={item.label} href={item.href} isSelected={pathname === item.href || (item.href.includes('/docs') && pathname.includes('/docs')) || (item.href.includes('/playground') && pathname.includes('/playground'))} />)}
            </SideNavSection>
            <SideNavSection title="Resources">
              <SideNavItem label={copy.github} href="https://github.com/adamsy1996/streamviz" />
            </SideNavSection>
          </MobileNav>
        ),
      }}
    >
      {children}
    </AppShell>
  )
}
