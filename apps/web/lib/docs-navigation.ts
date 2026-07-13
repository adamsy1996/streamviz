import { pathFor, type Locale } from '@/lib/site'

type DocsItem = { title: string; titleZh: string; slug: string }
type DocsGroup = { label: string; labelZh: string; items: DocsItem[] }

export const docsGroups: DocsGroup[] = [
  {
    label: 'Getting started', labelZh: '快速开始',
    items: [
      { title: 'Introduction', titleZh: '介绍', slug: '' },
      { title: 'Installation', titleZh: '安装', slug: 'getting-started' },
      { title: 'React integration', titleZh: 'React 集成', slug: 'integration' },
    ],
  },
  {
    label: 'Core concepts', labelZh: '核心概念',
    items: [
      { title: 'Streaming HTML', titleZh: '流式 HTML', slug: 'streaming-html' },
      { title: 'Security model', titleZh: '安全模型', slug: 'security' },
      { title: 'Protocol', titleZh: '协议', slug: 'protocol' },
    ],
  },
  {
    label: 'Customization', labelZh: '定制能力',
    items: [
      { title: 'Theming', titleZh: '主题', slug: 'theming' },
      { title: 'Host API', titleZh: '宿主 API', slug: 'host-api' },
    ],
  },
  {
    label: 'Reference', labelZh: '参考',
    items: [
      { title: 'API reference', titleZh: 'API 参考', slug: 'api-reference' },
    ],
  },
]

export function docsHref(locale: Locale, slug: string) {
  return pathFor(locale, slug ? `/docs/${slug}` : '/docs')
}

export function flatDocs(locale: Locale) {
  return docsGroups.flatMap((group) => group.items.map((item) => ({
    title: locale === 'zh' ? item.titleZh : item.title,
    href: docsHref(locale, item.slug),
    slug: item.slug,
  })))
}
