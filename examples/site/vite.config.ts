import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const packageSrc = path.resolve(__dirname, '../../src')
const siteBase = process.env.STREAMVIZ_SITE_BASE || '/'

export default defineConfig({
  base: siteBase,
  plugins: [react()],
  resolve: {
    alias: {
      'streamviz/styles.css': path.resolve(packageSrc, 'theme/styles.css'),
      'streamviz/core': path.resolve(packageSrc, 'core/index.ts'),
      'streamviz/protocol': path.resolve(packageSrc, 'protocol/index.ts'),
      'streamviz/react': path.resolve(packageSrc, 'react/index.ts'),
      'streamviz': packageSrc,
    },
  },
})
