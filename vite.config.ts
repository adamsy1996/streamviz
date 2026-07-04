import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-runtime-css',
      closeBundle() {
        const source = path.resolve(__dirname, 'src/theme/visualize-widget-runtime.css')
        fs.copyFileSync(source, path.resolve(__dirname, 'dist/visualize-widget-runtime.css'))
        fs.copyFileSync(source, path.resolve(__dirname, 'dist/styles.css'))
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        core: path.resolve(__dirname, 'src/core/index.ts'),
        protocol: path.resolve(__dirname, 'src/protocol/index.ts'),
        react: path.resolve(__dirname, 'src/react/index.ts'),
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
