import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StreamViz',
    short_name: 'StreamViz',
    description: 'Streaming visual artifacts for AI agents.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
