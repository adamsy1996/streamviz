import * as stylex from '@stylexjs/stylex'
import { Outline } from '@astryxdesign/core/Outline'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { isValidElement, type ReactNode } from 'react'

type TocItem = { title: ReactNode; url: string; depth: number }

const styles = stylex.create({
  toc: {
    alignSelf: 'flex-start',
    position: 'sticky',
    top: spacingVars['--spacing-12'],
    maxHeight: `calc(100vh - ${spacingVars['--spacing-12']} * 2)`,
    overflowY: 'auto',
    flexShrink: 0,
    '@media (max-width: 64rem)': {
      display: 'none',
    },
  },
})

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children)
  return ''
}

export function DocsToc({ items }: { items: TocItem[] }) {
  if (!items.length) return null
  return (
    <VStack gap={3} padding={4} width={240} xstyle={styles.toc}>
      <Text type="supporting" weight="bold">On this page</Text>
      <Outline density="compact" label="Table of contents" items={items.map(item => ({ id: item.url.replace(/^#/, ''), label: nodeText(item.title), level: item.depth }))} />
    </VStack>
  )
}
