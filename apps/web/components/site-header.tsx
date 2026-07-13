'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SignalLogo } from '@/components/signal-logo'
import { GitHubIcon } from '@/components/github-icon'
import { pathFor, siteCopy, swapLocalePath, type Locale } from '@/lib/site'

export function SiteHeader({ locale = 'en' }: { locale?: Locale }) {
  const copy = siteCopy[locale]
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const links = [
    { href: pathFor(locale), label: copy.nav.home, match: locale === 'en' ? pathname === '/' : pathname === '/zh' },
    { href: pathFor(locale, '/docs'), label: copy.nav.docs, match: pathname.includes('/docs') },
    { href: pathFor(locale, '/features'), label: copy.nav.features, match: pathname.includes('/features') },
    { href: pathFor(locale, '/playground'), label: copy.nav.playground, match: pathname.includes('/playground') },
  ]

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <SignalLogo locale={locale} />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((item) => (
            <Link key={item.href} className={item.match ? 'is-active' : ''} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Button asChild variant="outline" size="sm">
            <Link href={swapLocalePath(pathname, locale)}>{copy.language}</Link>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={copy.theme}
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {mounted && resolvedTheme === 'dark' ? <Sun /> : <Moon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copy.theme}</TooltipContent>
          </Tooltip>
          <Button className="github-link" asChild variant="outline" size="sm">
            <a href="https://github.com/adamsy1996/streamviz"><GitHubIcon data-icon="inline-start" />{copy.github}</a>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="mobile-menu-trigger" variant="outline" size="icon-sm" aria-label={copy.menu}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>StreamViz</SheetTitle>
                <SheetDescription>{copy.footer}</SheetDescription>
              </SheetHeader>
              <nav className="mobile-nav" aria-label="Mobile navigation">
                {links.map((item) => (
                  <Link key={item.href} className={item.match ? 'is-active' : ''} href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
