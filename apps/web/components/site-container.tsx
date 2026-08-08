import { VStack } from '@astryxdesign/core/Layout'
import type { ReactNode } from 'react'

const containerWidths = {
  content: 840,
  marketing: 1200,
  workbench: 1440,
} as const

export function SiteContainer({ size, children }: { size: keyof typeof containerWidths; children: ReactNode }) {
  return (
    <VStack hAlign="center" width="100%">
      <VStack width="100%" maxWidth={containerWidths[size]}>
        {children}
      </VStack>
    </VStack>
  )
}
