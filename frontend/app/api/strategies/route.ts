import { NextRequest, NextResponse } from 'next/server'

const BACKEND = (process.env.BACKEND_ORIGIN || 'https://ethglobal-delhi.onrender.com').replace(/\/$/, '')

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

