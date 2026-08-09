'use client'

import { Card, HStack, VStack } from '@astryxdesign/core/Layout'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'
import { useTheme } from '@astryxdesign/core/theme'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { useEffect, useState } from 'react'
import { StreamVisualization } from 'streamviz/react'

const artifact = `<section class="sv-root">
  <div class="sv-row sv-between">
    <div>
      <p class="sv-label">Streaming artifact</p>
      <h2 class="sv-title">Quarterly revenue</h2>
    </div>
    <span class="sv-badge sv-badge-success">Live</span>
  </div>
  <div class="sv-grid sv-grid-3">
    <article class="sv-card sv-card-muted"><p class="sv-label">Revenue</p><p class="sv-value">$8.42M</p></article>
    <article class="sv-card sv-card-muted"><p class="sv-label">Growth</p><p class="sv-value">+12.4%</p></article>
    <article class="sv-card sv-card-muted"><p class="sv-label">Forecast</p><p class="sv-value">$9.10M</p></article>
  </div>
  <svg viewBox="0 0 720 180" role="img" aria-label="Revenue trend rising across four quarters">
    <path d="M24 146 C140 140 180 104 282 112 S442 72 520 82 S630 40 696 34" fill="none" stroke="var(--sem-accent-primary)" stroke-width="5" stroke-linecap="round"/>
    <path d="M24 146 C140 140 180 104 282 112 S442 72 520 82 S630 40 696 34 L696 170 L24 170 Z" fill="var(--sem-accent-soft)" opacity=".5"/>
  </svg>
</section>`

export function DocsArtifactPreview() {
  const { mode } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StatusDot variant="success" label="Live example" isPulsing />
        <Text type="supporting" weight="bold">LIVE STREAMVIZ OUTPUT</Text>
      </HStack>
      {isMounted ? (
        <StreamVisualization
          title="Quarterly revenue"
          code={artifact}
          exportCode={artifact}
          loadingMessage="Rendering streamed HTML"
          final
          showActions={false}
          theme={{ mode }}
        />
      ) : <Card variant="muted" minHeight={`calc(${spacingVars['--spacing-12']} * 5)`} />}
    </VStack>
  )
}
