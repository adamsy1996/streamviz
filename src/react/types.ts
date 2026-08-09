import type React from 'react'

export type StreamVisualizationThemeTokens = {
  backgroundPage: string
  backgroundSurface: string
  backgroundElevated: string
  backgroundMuted: string
  backgroundInfo: string
  backgroundSuccess: string
  backgroundWarning: string
  backgroundDanger: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInfo: string
  textSuccess: string
  textWarning: string
  textDanger: string
  borderSubtle: string
  borderDefault: string
  borderStrong: string
  borderInfo: string
  borderSuccess: string
  borderWarning: string
  borderDanger: string
  accent: string
  statusInfo: string
  statusSuccess: string
  statusWarning: string
  statusDanger: string
  radiusMedium: string
  radiusLarge: string
  radiusExtraLarge: string
  fontSans: string
  fontSerif: string
  fontMono: string
  chartSeries: readonly string[]
}

export type StreamVisualizationTheme = {
  mode?: 'light' | 'dark' | 'system'
  tokens?: Partial<StreamVisualizationThemeTokens>
}

export type VisualizeWidgetFrameProps = {
  title: string
  code: string
  exportCode: string
  loadingMessage: string
  loadingMessages?: string[]
  /** Minimum time each loading message stays visible after renderable code arrives. Defaults to 1000ms. Set to 0 for immediate streaming. */
  loadingDwellMs?: number
  final: boolean
  /** Whether to render the copy and export actions after the artifact completes. Defaults to true. */
  showActions?: boolean
  onSendPrompt?: (prompt: string) => void
  renderIcon?: (name: 'check' | 'copy' | 'download' | 'code-xml', options: { className?: string }) => React.ReactNode
  notify?: (message: string, variant: 'success' | 'error') => void
  writeImageToClipboard?: (dataUrl: string) => Promise<boolean> | boolean
  theme?: StreamVisualizationTheme
  /** @deprecated Prefer theme.mode. */
  getTheme?: () => 'light' | 'dark' | string
  cssVarNames?: readonly string[]
}
