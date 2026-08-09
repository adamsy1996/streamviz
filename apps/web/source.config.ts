import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docs = defineDocs({ dir: 'content/docs/en' })

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      addLanguageClass: true,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
