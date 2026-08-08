import { createMDX } from 'fumadocs-mdx/next'
import withStylexTurbopack from '@stylexswc/nextjs-plugin/turbopack'
import path from 'node:path'

const configuredBase = process.env.STREAMVIZ_SITE_BASE || ''
const basePath = configuredBase === '/' ? '' : configuredBase.replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const config = {
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
}

const withStylex = withStylexTurbopack({
  rsOptions: {
    dev: process.env.NODE_ENV !== 'production',
    include: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}', 'lib/**/*.{js,jsx,ts,tsx}'],
    exclude: ['node_modules/**', '.next/**'],
    aliases: { '@/*': ['./*'] },
    unstable_moduleResolution: { type: 'commonJS' },
  },
})

export default createMDX()(withStylex(config))
