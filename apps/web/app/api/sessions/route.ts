import { listMastraThreads } from '@/lib/server/mastra-agent'

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get('q')?.trim().toLocaleLowerCase() || ''
    const result = await listMastraThreads()
    return Response.json({
      ...result,
      threads: query
        ? result.threads.filter(thread => (thread.title || 'New conversation').toLocaleLowerCase().includes(query))
        : result.threads,
    })
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason)
    return Response.json({ error: message }, { status: 502 })
  }
}
