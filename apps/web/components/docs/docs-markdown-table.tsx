'use client'

import * as stylex from '@stylexjs/stylex'
import { Table, TableCell, TableHeaderCell, TableRow } from '@astryxdesign/core/Table'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import type { ComponentProps } from 'react'

const styles = stylex.create({
  table: {
    minWidth: `calc(${spacingVars['--spacing-12']} * 12)`,
  },
})

export function DocsMarkdownTable({ children }: ComponentProps<'table'>) {
  return <Table<Record<string, unknown>> density="compact" dividers="rows" verticalAlign="top" xstyle={styles.table}>{children}</Table>
}

export function DocsMarkdownTableHead({ children }: ComponentProps<'thead'>) {
  return <thead>{children}</thead>
}

export function DocsMarkdownTableBody({ children }: ComponentProps<'tbody'>) {
  return <tbody>{children}</tbody>
}

export function DocsMarkdownTableRow({ children }: ComponentProps<'tr'>) {
  return <TableRow>{children}</TableRow>
}

export function DocsMarkdownTableHeaderCell({ children }: ComponentProps<'th'>) {
  return <TableHeaderCell scope="col">{children}</TableHeaderCell>
}

export function DocsMarkdownTableCell({ children }: ComponentProps<'td'>) {
  return <TableCell>{children}</TableCell>
}
