import { appendFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AgentRunResult, EventSink } from './types'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

const safeRunId = (value: string) => value.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80)

export class TraceWriter {
  readonly directory: string
  readonly tracePath: string

  constructor(runId: string, outputRoot = join(repoRoot, '.streamviz', 'runs')) {
    this.directory = join(outputRoot, safeRunId(runId))
    this.tracePath = join(this.directory, 'trace.jsonl')
  }

  async initialize() {
    await mkdir(this.directory, { recursive: true })
    await writeFile(this.tracePath, '', 'utf8')
  }

  sink: EventSink = async (event) => {
    await appendFile(this.tracePath, `${JSON.stringify(event)}\n`, 'utf8')
  }

  async finalize(result: AgentRunResult) {
    await writeFile(join(this.directory, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8')
    await Promise.all(result.widgets.map(async (widget, index) => {
      const filename = `${String(index + 1).padStart(2, '0')}-${widget.title.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 60) || 'widget'}.html`
      await writeFile(join(this.directory, filename), widget.widget_code, 'utf8')
    }))
    const latestPath = join(dirname(this.directory), '..', 'latest.json')
    await writeFile(latestPath, `${JSON.stringify({ directory: this.directory, result }, null, 2)}\n`, 'utf8')
  }
}
