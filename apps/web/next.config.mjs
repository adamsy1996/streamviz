import { createMDX } from 'fumadocs-mdx/next'
import path from 'node:path'

const configuredBase = process.env.STREAMVIZ_SITE_BASE || ''
const basePath = configuredBase === '/' ? '' : configuredBase.replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
}

export default createMDX()(config)
