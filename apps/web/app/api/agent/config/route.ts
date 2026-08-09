import { NextResponse } from 'next/server'
import { getPublicMastraAgentConfig } from '@/lib/server/mastra-agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getPublicMastraAgentConfig(), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
