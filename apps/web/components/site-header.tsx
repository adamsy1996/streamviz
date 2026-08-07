'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GitFork, Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SignalLogo } from '@/components/signal-logo'
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
    { href: pathFor(locale, '/playground'), label: copy.nav.playground, match: pathname.includes('/playground') },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="flex h-(--header-height) w-full items-center px-page">
        <SignalLogo locale={locale} />
        <nav className="ml-8 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((item) => (
            <Link key={item.href} className={`rounded-md px-3 py-2 text-sm transition-colors hover:text-foreground ${item.match ? 'bg-muted text-foreground' : 'text-muted-foreground'}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button className="hidden sm:inline-flex" asChild variant="ghost" size="sm">
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
          <Button className="hidden sm:inline-flex" asChild variant="outline" size="sm">
            <a href="https://github.com/adamsy1996/streamviz"><GitFork data-icon="inline-start" />{copy.github}</a>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant="outline" size="icon-sm" aria-label={copy.menu}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>StreamViz</SheetTitle>
                <SheetDescription>{copy.footer}</SheetDescription>
              </SheetHeader>
              <nav className="mt-6 grid gap-1" aria-label="Mobile navigation">
                {links.map((item) => (
                  <Link key={item.href} className={`rounded-lg px-3 py-2.5 text-sm ${item.match ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'}`} href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
                <Link className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground sm:hidden" href={swapLocalePath(pathname, locale)} onClick={() => setOpen(false)}>{copy.language}</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
