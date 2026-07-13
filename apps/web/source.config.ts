import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docsEn = defineDocs({ dir: 'content/docs/en' })
export const docsZh = defineDocs({ dir: 'content/docs/zh' })

export default defineConfig()
