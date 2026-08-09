type DocsItem = { title: string; slug: string }
type DocsGroup = { label: string; items: DocsItem[] }

export const docsGroups: DocsGroup[] = [
  {
    label: 'Getting started',
    items: [
      { title: 'Introduction', slug: '' },
      { title: 'Installation', slug: 'getting-started' },
      { title: 'React integration', slug: 'integration' },
    ],
  },
  {
    label: 'Core concepts',
    items: [
      { title: 'Streaming HTML', slug: 'streaming-html' },
      { title: 'Security model', slug: 'security' },
      { title: 'Protocol', slug: 'protocol' },
    ],
  },
  {
    label: 'Customization',
    items: [
      { title: 'Theming', slug: 'theming' },
      { title: 'Host API', slug: 'host-api' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { title: 'API reference', slug: 'api-reference' },
    ],
  },
]

export function docsHref(slug: string) {
  return slug ? `/docs/${slug}` : '/docs'
}

export function flatDocs() {
  return docsGroups.flatMap((group) => group.items.map((item) => ({
    title: item.title,
    href: docsHref(item.slug),
    slug: item.slug,
  })))
}
