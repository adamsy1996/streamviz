import { streamAgentRun } from '@/lib/server/mini-agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const encoder = new TextEncoder()

export async function POST(request: Request) {
  let body: { prompt?: unknown }
  try {
    body = await request.json() as { prompt?: unknown }
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) return Response.json({ error: 'Prompt is required' }, { status: 400 })
  if (prompt.length > 20_000) return Response.json({ error: 'Prompt is too long' }, { status: 413 })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (event: object) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      }
      try {
        await streamAgentRun({ prompt, signal: request.signal, emit: write })
      } catch (error) {
        if (!request.signal.aborted) {
          write({
            type: 'server.error',
            message: error instanceof Error ? error.message : String(error),
          })
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
