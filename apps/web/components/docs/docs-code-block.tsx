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
  if (!isValidElement<{ className?: string }>(node)) return 'plaintext'
  return node.props.className?.match(/language-([\w-]+)/)?.[1] ?? 'plaintext'
}

export function DocsCodeBlock({ icon: _icon, children }: HighlightedPreProps) {
  const code = nodeText(children).replace(/\n$/, '')
  const language = languageFrom(children)
  const lineCount = code.split('\n').length

  return (
    <CodeBlock
      code={code}
      language={language}
      width="100%"
      hasCopyButton
      hasLanguageLabel={language !== 'plaintext'}
      hasLineNumbers={lineCount >= 5}
      isWrapped={false}
      isCollapsible={lineCount > 24}
      collapsibleThreshold={24}
    />
  )
}
