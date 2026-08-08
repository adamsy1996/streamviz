import { Outline } from '@astryxdesign/core/Outline'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { isValidElement, type ReactNode } from 'react'

type TocItem = { title: ReactNode; url: string; depth: number }

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children)
  return ''
}

export function DocsToc({ items, locale }: { items: TocItem[]; locale: 'en' | 'zh' }) {
  if (!items.length) return null
  return (
    <VStack gap={3} padding={4} width={240}>
      <Text type="supporting" weight="bold">{locale === 'zh' ? '本页内容' : 'On this page'}</Text>
      <Outline density="compact" label={locale === 'zh' ? '本页目录' : 'Table of contents'} items={items.map(item => ({ id: item.url.replace(/^#/, ''), label: nodeText(item.title), level: item.depth }))} />
    </VStack>
  )
}
