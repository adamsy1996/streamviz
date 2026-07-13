'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { docsGroups, docsHref } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

export function DocsSearch({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const choose = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button className="docs-search-trigger" variant="outline" onClick={() => setOpen(true)}>
        <Search data-icon="inline-start" />
        <span>{locale === 'zh' ? '搜索文档' : 'Search docs'}</span>
        <kbd>⌘K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title={locale === 'zh' ? '搜索文档' : 'Search documentation'} description={locale === 'zh' ? '跳转到任意 StreamViz 文档页面。' : 'Jump to any StreamViz documentation page.'}>
        <Command>
          <CommandInput placeholder={locale === 'zh' ? '输入页面名称…' : 'Type a page name…'} />
          <CommandList>
            <CommandEmpty>{locale === 'zh' ? '没有找到结果。' : 'No results found.'}</CommandEmpty>
            {docsGroups.map((group) => (
              <CommandGroup key={group.label} heading={locale === 'zh' ? group.labelZh : group.label}>
                {group.items.map((item) => {
                  const title = locale === 'zh' ? item.titleZh : item.title
                  const href = docsHref(locale, item.slug)
                  return <CommandItem key={href} value={title} onSelect={() => choose(href)}>{title}</CommandItem>
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
