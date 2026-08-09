'use client'

import { Icon } from '@astryxdesign/core/Icon'
import { HStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import type { SVGProps } from 'react'

export function SignalMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 34 22" aria-hidden="true" {...props}>
      <path d="M1 12h7l3-8 5 15 4-11 4 8h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SignalLogo() {
  return (
    <Link href="/" color="primary" label="StreamViz home">
      <HStack gap={2} vAlign="center">
        <Icon icon={SignalMark} size="lg" color="accent" />
        <Text type="large" weight="bold">StreamViz</Text>
      </HStack>
    </Link>
  )
}
