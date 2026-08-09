import { Banner } from '@astryxdesign/core/Banner'
import type { ReactNode } from 'react'

export function DocsNote({ title, children, status = 'info' }: { title: string; children?: ReactNode; status?: 'info' | 'warning' | 'success' }) {
  return <Banner status={status} title={title} description={children} />
}
