import type { StreamVisualizationTheme, StreamVisualizationThemeTokens, VisualizeWidgetFrameProps } from './types'

export const VISUALIZE_WIDGET_VARS = [
  '--sem-bg-page', '--sem-bg-surface', '--sem-bg-card', '--sem-bg-muted', '--sem-border-subtle',
  '--sem-border-default', '--sem-border-strong', '--sem-text-primary',
  '--sem-text-secondary', '--sem-text-tertiary', '--sem-accent-primary',
  '--sem-status-info', '--sem-status-success', '--sem-status-warning',
  '--sem-status-danger', '--blue-9', '--cyan-9', '--green-9', '--amber-9',
  '--orange-9', '--red-9', '--violet-9', '--pink-9', '--shadow-lg',
  '--text-sm', '--font-sans', '--font-mono', '--spacing',
] as const

/** Stable, typed host customization keys supported across minor releases. */
export const STREAM_VISUALIZATION_THEME_TOKEN_NAMES = [
  'backgroundPage', 'backgroundSurface', 'backgroundElevated', 'backgroundMuted',
  'backgroundInfo', 'backgroundSuccess', 'backgroundWarning', 'backgroundDanger',
  'textPrimary', 'textSecondary', 'textMuted', 'textInfo', 'textSuccess',
  'textWarning', 'textDanger', 'borderSubtle', 'borderDefault', 'borderStrong',
  'borderInfo', 'borderSuccess', 'borderWarning', 'borderDanger', 'accent',
  'statusInfo', 'statusSuccess', 'statusWarning', 'statusDanger', 'radiusMedium',
  'radiusLarge', 'radiusExtraLarge', 'fontSans', 'fontSerif', 'fontMono',
  'chartSeries',
] as const satisfies readonly (keyof StreamVisualizationThemeTokens)[]

const THEME_TOKEN_VARS: Record<Exclude<keyof StreamVisualizationThemeTokens, 'chartSeries'>, readonly string[]> = {
  backgroundPage: ['--sv-bg-page', '--color-background-tertiary', '--sem-bg-page'],
  backgroundSurface: ['--sv-bg-surface', '--color-background-primary', '--sem-bg-surface'],
  backgroundElevated: ['--sv-bg-elevated', '--color-background-secondary', '--sem-bg-card'],
  backgroundMuted: ['--sv-bg-muted', '--color-background-muted', '--sem-bg-muted'],
  backgroundInfo: ['--sv-bg-info', '--color-background-info'],
  backgroundSuccess: ['--sv-bg-success', '--color-background-success'],
  backgroundWarning: ['--sv-bg-warning', '--color-background-warning'],
  backgroundDanger: ['--sv-bg-danger', '--color-background-danger'],
  textPrimary: ['--sv-text-primary', '--color-text-primary', '--sem-text-primary'],
  textSecondary: ['--sv-text-secondary', '--color-text-secondary', '--sem-text-secondary'],
  textMuted: ['--sv-text-muted', '--color-text-tertiary', '--sem-text-tertiary'],
  textInfo: ['--sv-text-info', '--color-text-info'],
  textSuccess: ['--sv-text-success', '--color-text-success'],
  textWarning: ['--sv-text-warning', '--color-text-warning'],
  textDanger: ['--sv-text-danger', '--color-text-danger'],
  borderSubtle: ['--sv-border-subtle', '--color-border-tertiary', '--sem-border-subtle'],
  borderDefault: ['--sv-border-default', '--color-border-secondary', '--sem-border-default'],
  borderStrong: ['--sv-border-strong', '--color-border-primary', '--sem-border-strong'],
  borderInfo: ['--sv-border-info', '--color-border-info'],
  borderSuccess: ['--sv-border-success', '--color-border-success'],
  borderWarning: ['--sv-border-warning', '--color-border-warning'],
  borderDanger: ['--sv-border-danger', '--color-border-danger'],
  accent: ['--sv-accent', '--sem-accent-primary'],
  statusInfo: ['--sv-status-info', '--sem-status-info'],
  statusSuccess: ['--sv-status-success', '--sem-status-success'],
  statusWarning: ['--sv-status-warning', '--sem-status-warning'],
  statusDanger: ['--sv-status-danger', '--sem-status-danger'],
  radiusMedium: ['--sv-radius-md', '--border-radius-md'],
  radiusLarge: ['--sv-radius-lg', '--border-radius-lg'],
  radiusExtraLarge: ['--sv-radius-xl', '--border-radius-xl'],
  fontSans: ['--sv-font-sans', '--font-sans'],
  fontSerif: ['--sv-font-serif', '--font-serif'],
  fontMono: ['--sv-font-mono', '--font-mono'],
}

const sanitizeThemeToken = (value: unknown) => {
  const token = String(value || '').trim()
  if (!token || token.length > 512 || /[;{}<>]/.test(token)) return ''
  return token
}

const referencedCssVar = (value: string) => value.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i)?.[1] || ''

export const serializeThemeCssVars = (theme?: StreamVisualizationTheme) => {
  const tokens = theme?.tokens
  if (!tokens) return ''
  const declarations: string[] = []
  Object.entries(THEME_TOKEN_VARS).forEach(([key, names]) => {
    const value = sanitizeThemeToken(tokens[key as Exclude<keyof StreamVisualizationThemeTokens, 'chartSeries'>])
    if (!value) return
    const referencedName = referencedCssVar(value)
    names.forEach((name) => {
      if (name !== referencedName) declarations.push(`${name}:${value};`)
    })
  })
  tokens.chartSeries?.slice(0, 8).forEach((rawValue, index) => {
    const value = sanitizeThemeToken(rawValue)
    if (!value) return
    const referencedName = referencedCssVar(value)
    ;[`--sv-chart-series-${index + 1}`, `--chart-series-${index + 1}`].forEach((name) => {
      if (name !== referencedName) declarations.push(`${name}:${value};`)
    })
  })
  return declarations.join('')
}

export const resolveWidgetTheme = (
  theme: StreamVisualizationTheme | undefined,
  getTheme?: VisualizeWidgetFrameProps['getTheme'],
) => {
  const requestedMode = theme?.mode
  if (requestedMode === 'light' || requestedMode === 'dark') return requestedMode
  const explicitTheme = String(getTheme?.() || document.documentElement.dataset.theme || '').trim()
  if (explicitTheme === 'light' || explicitTheme === 'dark') return explicitTheme
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const collectCssVars = (styles: CSSStyleDeclaration, names: readonly string[]) =>
  names.map((name) => {
    const value = styles.getPropertyValue(name).trim()
    return value ? `${name}:${value};` : ''
  }).join('')
