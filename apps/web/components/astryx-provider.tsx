'use client'

import { LinkProvider } from '@astryxdesign/core/Link'
import { Theme, type ThemeMode } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import Link from 'next/link'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type SiteThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null)

export function useSiteTheme() {
  const value = useContext(SiteThemeContext)
  if (!value) throw new Error('useSiteTheme must be used within AstryxProvider')
  return value
}

export function AstryxProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    const stored = window.localStorage.getItem('streamviz-theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') setMode(stored)
  }, [])

  const value = useMemo<SiteThemeContextValue>(() => ({
    mode,
    setMode(nextMode) {
      window.localStorage.setItem('streamviz-theme', nextMode)
      setMode(nextMode)
    },
    toggleMode() {
      const nextMode = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem('streamviz-theme', nextMode)
      setMode(nextMode)
    },
  }), [mode])

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <LinkProvider component={Link}>
        <SiteThemeContext.Provider value={value}>
          {children}
        </SiteThemeContext.Provider>
      </LinkProvider>
    </Theme>
  )
}
