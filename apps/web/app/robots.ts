import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.STREAMVIZ_SITE_URL || 'https://streamviz.dev').replace(/\/$/, '')

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  }
}
