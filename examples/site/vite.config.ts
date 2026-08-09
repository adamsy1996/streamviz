import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const packageSrc = path.resolve(__dirname, '../../src')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'streamviz-react/styles.css': path.resolve(packageSrc, 'theme/styles.css'),
      'streamviz-react/core': path.resolve(packageSrc, 'core/index.ts'),
      'streamviz-react/protocol': path.resolve(packageSrc, 'protocol/index.ts'),
      'streamviz-react/react': path.resolve(packageSrc, 'react/index.ts'),
      'streamviz-react': packageSrc,
    },
  },
})
