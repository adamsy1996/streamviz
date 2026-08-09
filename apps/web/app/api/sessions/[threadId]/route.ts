import {
  deleteMastraThread,
  getMastraThreadMessages,
  updateMastraThread,
} from '@/lib/server/mastra-agent'

type ThreadRouteContext = { params: Promise<{ threadId: string }> }

const getThreadId = async (context: ThreadRouteContext) => {
  const { threadId } = await context.params
  return threadId.trim()
}

export async function GET(_request: Request, context: ThreadRouteContext) {
  const threadId = await getThreadId(context)
  if (!threadId) return Response.json({ error: 'Thread ID is required' }, { status: 400 })

  try {
    return Response.json({ messages: await getMastraThreadMessages(threadId) })
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason)
    return Response.json({ error: message }, { status: 502 })
  }
}

export async function PATCH(request: Request, context: ThreadRouteContext) {
  const threadId = await getThreadId(context)
  const body = await request.json().catch(() => ({})) as { title?: unknown }
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!threadId) return Response.json({ error: 'Thread ID is required' }, { status: 400 })
  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 })
  if (title.length > 120) return Response.json({ error: 'Title is too long' }, { status: 413 })

  try {
    return Response.json({ thread: await updateMastraThread(threadId, title) })
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason)
    return Response.json({ error: message }, { status: 502 })
  }
}

export async function DELETE(_request: Request, context: ThreadRouteContext) {
  const threadId = await getThreadId(context)
  if (!threadId) return Response.json({ error: 'Thread ID is required' }, { status: 400 })

  try {
    await deleteMastraThread(threadId)
    return new Response(null, { status: 204 })
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason)
    return Response.json({ error: message }, { status: 502 })
  }
}
