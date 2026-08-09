'use client'

import * as stylex from '@stylexjs/stylex'
import { MarkGithubIcon } from '@primer/octicons-react'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'
import { HStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav'
import { useTheme } from '@astryxdesign/core/theme'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Moon, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSiteTheme } from '@/components/astryx-provider'
import { SignalMark } from '@/components/signal-logo'
import { siteCopy } from '@/lib/site'

const styles = stylex.create({
  frostedNav: {
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-background-surface']} 82%, transparent)`,
    backdropFilter: `blur(${spacingVars['--spacing-3']})`,
  },
})

export function SiteHeader() {
  const copy = siteCopy
  const pathname = usePathname()
  const { mode } = useTheme()
  const { toggleMode } = useSiteTheme()
  const [isCompact, setIsCompact] = useState(false)
  const links = [
    { href: '/', label: copy.nav.home, selected: pathname === '/' },
    { href: '/docs', label: copy.nav.docs, selected: pathname.includes('/docs') },
    { href: '/playground', label: copy.nav.playground, selected: pathname.includes('/playground') },
  ]

  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <TopNav
      label="Primary navigation"
      xstyle={styles.frostedNav}
      heading={<TopNavHeading logo={<Icon icon={SignalMark} color="accent" size="lg" />} heading="StreamViz" headingHref="/" />}
      centerContent={isCompact ? undefined : links.map(item => <TopNavItem key={item.href} label={item.label} href={item.href} isSelected={item.selected} />)}
      endContent={
        <HStack gap={1} vAlign="center">
          <IconButton
            label={copy.theme}
            tooltip={copy.theme}
            variant="ghost"
            size="sm"
            icon={<Icon icon={mode === 'dark' ? Sun : Moon} size="sm" />}
            onClick={toggleMode}
          />
          {isCompact ? null : (
            <Link href="https://github.com/adamsy1996/streamviz" isExternalLink color="secondary" label={copy.github}>
              <HStack gap={1} vAlign="center"><Icon icon={MarkGithubIcon} size="sm" />{copy.github}</HStack>
            </Link>
          )}
        </HStack>
      }
    />
  )
}
