import { NextRequest, NextResponse } from 'next/server'
import { isHumanOnChain } from '@/lib/selfContract'

const BACKEND = (process.env.BACKEND_ORIGIN || 'https://ethglobal-delhi.onrender.com').replace(/\/$/, '')

export const runtime = 'nodejs'

export async function GET() {
  const r = await fetch(`${BACKEND}/api/strategies`, { cache: 'no-store' })
  const text = await r.text()
  try {
    return new NextResponse(text, { status: r.status, headers: { 'content-type': 'application/json' } })
  } catch {
    return new NextResponse(text, { status: r.status })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  // Enforce Self verification on create-strategy requests
  try {
    const parsed = body ? JSON.parse(body) : null
    const userAddress = parsed?.userAddress as string | undefined
    if (!userAddress) {
      return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 })
    }
    const verified = await isHumanOnChain(userAddress)
    if (!verified) {
      return NextResponse.json({ error: 'Identity verification required' }, { status: 403 })
    }
  } catch {
    // If body is not JSON, treat as bad request
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const r = await fetch(`${BACKEND}/api/strategies`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    cache: 'no-store',
  })
  const text = await r.text()
  return new NextResponse(text, { status: r.status, headers: { 'content-type': 'application/json' } })
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 })
}
