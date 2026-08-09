import { streamMastraAgent } from '@/lib/server/mastra-agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: { prompt?: unknown; threadId?: unknown }
  try {
    body = await request.json() as { prompt?: unknown; threadId?: unknown }
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  const threadId = typeof body.threadId === 'string' ? body.threadId.trim() : ''
  if (!prompt) return Response.json({ error: 'Prompt is required' }, { status: 400 })
  if (prompt.length > 20_000) return Response.json({ error: 'Prompt is too long' }, { status: 413 })
  if (!threadId) return Response.json({ error: 'Thread ID is required' }, { status: 400 })
  if (threadId.length > 200) return Response.json({ error: 'Thread ID is too long' }, { status: 413 })

  let upstream: Response
  try {
    upstream = await streamMastraAgent({ prompt, threadId, signal: request.signal })
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Could not reach the Mastra agent service',
    }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    return Response.json({
      error: detail || `Mastra returned HTTP ${upstream.status}`,
    }, { status: upstream.status || 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    },
  })
}
