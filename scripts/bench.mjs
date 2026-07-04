import { performance } from 'node:perf_hooks'
import { extractVisualizeWidgetPayload } from '../dist/core.js'

const raw = JSON.stringify({
  title: 'Streaming benchmark',
  widget_code: '<section><h2>Revenue</h2><p>Partial content that grows during a tool call.</p></section>',
  loading_messages: ['Preparing chart', 'Rendering table'],
}).slice(0, -8)

const iterations = 20_000
const start = performance.now()

for (let index = 0; index < iterations; index += 1) {
  extractVisualizeWidgetPayload({
    tool_status: 'running',
    raw,
  })
}

const elapsed = performance.now() - start
const perOp = elapsed / iterations

console.log(`extractVisualizeWidgetPayload x ${iterations}: ${elapsed.toFixed(2)} ms (${perOp.toFixed(4)} ms/op)`)

if (perOp > 0.25) {
  console.error('Benchmark exceeded 0.25 ms/op budget.')
  process.exit(1)
}
