import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { isValidElement, type ComponentProps, type ReactNode } from 'react'

type HighlightedPreProps = ComponentProps<'pre'> & { icon?: string }

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children)
  return ''
}

function languageFrom(node: ReactNode) {
  if (!isValidElement<{ className?: string }>(node)) return 'text'
  return node.props.className?.match(/language-([\w-]+)/)?.[1] ?? 'text'
}

export function DocsCodeBlock({ icon: _icon, children }: HighlightedPreProps) {
  return <CodeBlock code={nodeText(children).replace(/\n$/, '')} language={languageFrom(children)} width="100%" hasCopyButton hasLanguageLabel hasLineNumbers isWrapped />
}
