export type Locale = 'en' | 'zh'

export const siteCopy = {
  en: {
    nav: { home: 'Home', docs: 'Docs', features: 'Features', playground: 'Playground' },
    github: 'GitHub',
    language: '中文',
    theme: 'Toggle theme',
    menu: 'Open navigation',
    footer: 'Streaming visual artifacts for AI agents.',
    resources: 'Resources',
    community: 'Community',
  },
  zh: {
    nav: { home: '首页', docs: '文档', features: '特性', playground: '体验场' },
    github: 'GitHub',
    language: 'EN',
    theme: '切换主题',
    menu: '打开导航',
    footer: '为 AI Agent 流式生成可视化界面。',
    resources: '资源',
    community: '社区',
  },
} as const

export function pathFor(locale: Locale, path = '/') {
  if (locale === 'en') return path
  if (path === '/') return '/zh'
  return `/zh${path}`
}

export function swapLocalePath(pathname: string, locale: Locale) {
  if (locale === 'zh') {
    const next = pathname.replace(/^\/zh(?=\/|$)/, '') || '/'
    return next
  }
  return pathname === '/' ? '/zh' : `/zh${pathname}`
}
