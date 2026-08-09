import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const docs = ['', 'getting-started', 'integration', 'streaming-html', 'security', 'protocol', 'theming', 'host-api', 'api-reference']

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://streamviz.dev'
  const primary = ['', '/features', '/playground', '/chat', ...docs.map((slug) => slug ? `/docs/${slug}` : '/docs')]
  return primary.map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: path.includes('/docs') ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.includes('playground') ? 0.9 : 0.8,
  }))
}
