import * as stylex from '@stylexjs/stylex'
import { Code } from '@astryxdesign/core/Code'
import { Table, TableCell, TableHeaderCell, TableRow } from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

const styles = stylex.create({
  table: {
    minWidth: `calc(${spacingVars['--spacing-12']} * 17)`,
  },
})

export type DocsApiRow = {
  name: string
  type: string
  required?: boolean
  defaultValue?: string
  description: string
}

export function DocsApiTable({ rows }: { rows: DocsApiRow[] }) {
  return (
    <Table<Record<string, unknown>> density="compact" dividers="rows" verticalAlign="top" xstyle={styles.table}>
      <thead>
        <TableRow isHeaderRow>
          <TableHeaderCell scope="col">Name</TableHeaderCell>
          <TableHeaderCell scope="col">Type</TableHeaderCell>
          <TableHeaderCell scope="col">Required</TableHeaderCell>
          <TableHeaderCell scope="col">Default</TableHeaderCell>
          <TableHeaderCell scope="col">Description</TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        {rows.map(row => (
          <TableRow key={row.name}>
            <TableCell><Code>{row.name}</Code></TableCell>
            <TableCell><Code>{row.type}</Code></TableCell>
            <TableCell><Text>{row.required ? 'Yes' : 'No'}</Text></TableCell>
            <TableCell>{row.defaultValue ? <Code>{row.defaultValue}</Code> : <Text color="secondary">—</Text>}</TableCell>
            <TableCell><Text>{row.description}</Text></TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  )
}
