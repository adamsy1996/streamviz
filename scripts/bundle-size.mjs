import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const root = process.cwd()
const dist = path.join(root, 'dist')

if (!fs.existsSync(dist)) {
  console.error('dist/ is missing. Run npm run build first.')
  process.exit(1)
}

const files = fs
  .readdirSync(dist)
  .filter((file) => /\.(js|css)$/.test(file))
  .sort()

let total = 0
let gzipTotal = 0

for (const file of files) {
  const source = fs.readFileSync(path.join(dist, file))
  const gzip = gzipSync(source)
  total += source.length
  gzipTotal += gzip.length
  console.log(`${file.padEnd(36)} ${String(source.length).padStart(8)} B ${String(gzip.length).padStart(8)} B gzip`)
}

console.log(`${'total'.padEnd(36)} ${String(total).padStart(8)} B ${String(gzipTotal).padStart(8)} B gzip`)
