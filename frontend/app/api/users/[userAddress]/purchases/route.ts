import { NextRequest, NextResponse } from 'next/server'

const BACKEND = (process.env.BACKEND_ORIGIN || 'https://ethglobal-delhi.onrender.com').replace(/\/$/, '')

export async function GET(_req: NextRequest, ctx: { params: { userAddress: string } }) {
  const { userAddress } = ctx.params
  const r = await fetch(`${BACKEND}/api/users/${userAddress}/purchases`, { cache: 'no-store' })
  const text = await r.text()
  return new NextResponse(text, { status: r.status, headers: { 'content-type': 'application/json' } })
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 })
}

