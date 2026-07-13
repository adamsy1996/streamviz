import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import 'streamviz/styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
