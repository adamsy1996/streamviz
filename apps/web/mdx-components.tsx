import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { Blockquote } from '@astryxdesign/core/Blockquote'
import { Code } from '@astryxdesign/core/Code'
import { List, ListItem } from '@astryxdesign/core/List'
import { Link } from '@astryxdesign/core/Link'
import { Heading, Text } from '@astryxdesign/core/Text'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import { DocsApiTable } from '@/components/docs/docs-api-table'
import { DocsArtifactPreview } from '@/components/docs/docs-artifact-preview'
import { DocsNote } from '@/components/docs/docs-note'
import { DocsMarkdownTable, DocsMarkdownTableBody, DocsMarkdownTableCell, DocsMarkdownTableHead, DocsMarkdownTableHeaderCell, DocsMarkdownTableRow } from '@/components/docs/docs-markdown-table'

function DocsLink({ children, download, href = '', onClick, rel, target, title }: ComponentProps<'a'>) {
  const external = href.startsWith('http://') || href.startsWith('https://')
  return (
    <Link
      download={download}
      href={href}
      isExternalLink={external}
      onClick={onClick}
      rel={rel}
      target={target}
      tooltip={title}
    >
      {children}
    </Link>
  )
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    a: DocsLink,
    h2: ({ children, ...props }) => <Heading level={2} {...props}>{children}</Heading>,
    h3: ({ children, ...props }) => <Heading level={3} {...props}>{children}</Heading>,
    p: ({ children }) => <Text as="p" display="block">{children}</Text>,
    strong: ({ children }) => <Text weight="bold">{children}</Text>,
    code: ({ children, className }) => <Code className={className}>{children}</Code>,
    ul: ({ children }) => <List listStyle="disc">{children}</List>,
    ol: ({ children, start }) => <List listStyle="decimal" start={typeof start === 'number' ? start : undefined}>{children}</List>,
    li: ({ children }) => <ListItem label={children} />,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
    table: DocsMarkdownTable,
    thead: DocsMarkdownTableHead,
    tbody: DocsMarkdownTableBody,
    tr: DocsMarkdownTableRow,
    th: DocsMarkdownTableHeaderCell,
    td: DocsMarkdownTableCell,
    pre: DocsCodeBlock,
    ApiTable: DocsApiTable,
    ArtifactPreview: DocsArtifactPreview,
    Note: DocsNote,
    ...components,
  }
}
