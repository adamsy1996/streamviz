import type { Metadata } from 'next'
import './globals.css'
import 'streamviz-react/styles.css'
import { AstryxProvider } from '@/components/astryx-provider'

export const metadata: Metadata = {
  metadataBase: new URL('https://streamviz.dev'),
  title: {
    default: 'StreamViz — Streaming visual artifacts for AI agents',
    template: '%s — StreamViz',
  },
  description: 'Render AI-generated streaming HTML as secure, live visual artifacts.',
  openGraph: {
    title: 'StreamViz',
    description: 'Streaming visual artifacts for AI agents.',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light">
      <body>
        <AstryxProvider>{children}</AstryxProvider>
      </body>
    </html>
  )
}
