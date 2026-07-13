import type { ReactNode } from 'react'

type TocItem = { title: ReactNode; url: string; depth: number }

export function DocsToc({ items, locale }: { items: TocItem[]; locale: 'en' | 'zh' }) {
  if (!items.length) return null
  return (
    <aside className="docs-toc">
      <strong>{locale === 'zh' ? '本页内容' : 'On this page'}</strong>
      <nav>
        {items.map((item) => <a key={item.url} className={item.depth > 2 ? 'is-nested' : ''} href={item.url}>{item.title}</a>)}
      </nav>
    </aside>
  )
}
