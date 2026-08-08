import { NextResponse } from 'next/server'
import { getPublicAgentConfig } from '@/lib/server/mini-agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(getPublicAgentConfig(), {
    headers: { 'Cache-Control': 'no-store' },
  })
}
