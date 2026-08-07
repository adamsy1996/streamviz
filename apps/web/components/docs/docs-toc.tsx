import type { ReactNode } from 'react'

type TocItem = { title: ReactNode; url: string; depth: number }

export function DocsToc({ items, locale }: { items: TocItem[]; locale: 'en' | 'zh' }) {
  if (!items.length) return null
  return (
    <aside className="hidden px-6 py-14 xl:block">
      <strong className="text-xs font-medium">{locale === 'zh' ? '本页内容' : 'On this page'}</strong>
      <nav className="sticky top-24 mt-4 grid border-l pl-4">
        {items.map((item) => <a key={item.url} className={`py-1.5 text-xs leading-5 text-muted-foreground transition-colors hover:text-foreground ${item.depth > 2 ? 'pl-3' : ''}`} href={item.url}>{item.title}</a>)}
      </nav>
    </aside>
  )
}
