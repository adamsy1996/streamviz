'use client'

import { AppShell } from '@astryxdesign/core/AppShell'
import { MobileNav } from '@astryxdesign/core/MobileNav'
import { SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { pathFor, siteCopy, type Locale } from '@/lib/site'

export function SiteFrame({ locale = 'en', children, sideNav, height = 'auto' }: { locale?: Locale; children: ReactNode; sideNav?: ReactNode; height?: 'auto' | 'fill' }) {
  const pathname = usePathname()
  const copy = siteCopy[locale]
  const links = [
    { href: pathFor(locale), label: copy.nav.home },
    { href: pathFor(locale, '/docs'), label: copy.nav.docs },
    { href: pathFor(locale, '/playground'), label: copy.nav.playground },
  ]

  return (
    <AppShell
      topNav={<SiteHeader locale={locale} />}
      sideNav={sideNav}
      contentPadding={0}
      height={height}
      variant="section"
      mobileNav={{
        content: (
          <MobileNav header="StreamViz" label={copy.menu}>
            <SideNavSection title={locale === 'zh' ? '导航' : 'Navigation'}>
              {links.map(item => <SideNavItem key={item.href} label={item.label} href={item.href} isSelected={pathname === item.href || (item.href.includes('/docs') && pathname.includes('/docs')) || (item.href.includes('/playground') && pathname.includes('/playground'))} />)}
            </SideNavSection>
          </MobileNav>
        ),
      }}
    >
      {children}
    </AppShell>
  )
}
