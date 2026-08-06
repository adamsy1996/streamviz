import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const packageJsonPath = path.join(root, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const assert = (condition, message) => {
  if (!condition) {
    console.error(message)
    process.exitCode = 1
  }
}

const pathExists = (relativePath) => fs.existsSync(path.join(root, relativePath))

const exportedPath = (entry) => {
  const value = packageJson.exports[entry]
  if (typeof value === 'string') return value
  return value?.import
}

const importEntry = async (entry) => {
  const relativePath = exportedPath(entry)
  assert(relativePath, `Missing export target for ${entry}`)
  if (!relativePath) return null
  assert(pathExists(relativePath), `Export target does not exist: ${entry} -> ${relativePath}`)
  if (!pathExists(relativePath)) return null
  return import(pathToFileURL(path.join(root, relativePath)).href)
}

const main = await importEntry('.')
const core = await importEntry('./core')
const protocol = await importEntry('./protocol')
const react = await importEntry('./react')

assert(typeof main?.StreamVisualization === 'function', 'Main export must expose StreamVisualization')
assert(typeof main?.VisualizeWidgetFrame === 'function', 'Main export must expose VisualizeWidgetFrame compatibility alias')
assert(typeof main?.extractVisualizeWidgetPayload === 'function', 'Main export must expose extractVisualizeWidgetPayload')
assert(typeof core?.extractPartialJsonString === 'function', 'Core export must expose extractPartialJsonString')
assert(protocol?.VISUALIZE_SHOW_WIDGET_TOOL_NAME === 'visualize_show_widget', 'Protocol export must expose stable visualize_show_widget name')
assert(typeof react?.StreamVisualization === 'function', 'React export must expose StreamVisualization')

assert(pathExists('dist/styles.css'), 'dist/styles.css must exist')
assert(pathExists('dist/visualize-widget-runtime.css'), 'dist/visualize-widget-runtime.css must exist')
assert(pathExists('dist/visualize-widget-utilities.css'), 'dist/visualize-widget-utilities.css must exist')
assert(pathExists('src/protocol/visualize.readme.md'), 'visualize.readme.md package asset must exist')

assert(packageJson.exports['./styles.css'] === './dist/styles.css', 'styles.css export must point to dist/styles.css')
assert(
  packageJson.exports['./visualize-widget-utilities.css'] === './dist/visualize-widget-utilities.css',
  'visualize-widget-utilities.css export must point to dist/visualize-widget-utilities.css',
)
assert(
  packageJson.exports['./visualize.readme.md'] === './src/protocol/visualize.readme.md',
  'visualize.readme.md export must point to the packaged protocol asset',
)

const files = new Set(packageJson.files || [])
assert(files.has('dist'), 'package files must include dist')
assert(files.has('src/protocol/visualize.readme.md'), 'package files must include visualize.readme.md')
assert(files.has('README.md'), 'package files must include README.md')
assert(files.has('LICENSE'), 'package files must include LICENSE')

if (process.exitCode) process.exit(process.exitCode)

console.log('Public exports verified.')
