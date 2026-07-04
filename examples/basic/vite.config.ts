import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const packageSrc = path.resolve(__dirname, '../../src')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'streamviz/styles.css': path.resolve(packageSrc, 'theme/visualize-widget-runtime.css'),
      'streamviz/core': path.resolve(packageSrc, 'core/index.ts'),
      'streamviz/protocol': path.resolve(packageSrc, 'protocol/index.ts'),
      'streamviz/react': path.resolve(packageSrc, 'react/index.ts'),
      'streamviz': packageSrc,
    },
  },
})
