'use client'

import { Button } from '@astryxdesign/core/Button'
import { CommandPalette } from '@astryxdesign/core/CommandPalette'
import { Icon } from '@astryxdesign/core/Icon'
import { createStaticSource, type SearchableItem } from '@astryxdesign/core/Typeahead'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { docsGroups, docsHref } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

type DocsSearchItem = SearchableItem<{ href: string; group: string }>

export function DocsSearch({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const items = useMemo<DocsSearchItem[]>(() => docsGroups.flatMap(group => group.items.map(item => ({
    id: docsHref(locale, item.slug),
    label: locale === 'zh' ? item.titleZh : item.title,
    auxiliaryData: { href: docsHref(locale, item.slug), group: locale === 'zh' ? group.labelZh : group.label },
  }))), [locale])
  const source = useMemo(() => createStaticSource(items), [items])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <Button label={locale === 'zh' ? '搜索文档' : 'Search docs'} variant="secondary" width="100%" icon={<Icon icon="search" size="sm" />} endContent={<Icon icon="moreHorizontal" size="sm" />} onClick={() => setOpen(true)} />
      <CommandPalette
        isOpen={open}
        onOpenChange={setOpen}
        searchSource={source}
        label={locale === 'zh' ? '搜索文档' : 'Search documentation'}
        emptySearchText={locale === 'zh' ? '没有找到结果。' : 'No results found.'}
        onValueChange={(id) => { setOpen(false); router.push(id) }}
      />
    </>
  )
}
