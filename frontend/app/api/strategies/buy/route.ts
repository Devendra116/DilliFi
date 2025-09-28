import { NextRequest, NextResponse } from 'next/server'

const BACKEND = (process.env.BACKEND_ORIGIN || 'https://ethglobal-delhi.onrender.com').replace(/\/$/, '')

export async function POST(req: NextRequest) {
  // Allow a development bypass to keep the demo flowing without x402 setup
  try {
    const raw = await req.text()
    let json: any = undefined
    try { json = raw ? JSON.parse(raw) : undefined } catch { /* ignore */ }

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        bypass: true,
        message: 'x402 bypass enabled (dev mode) — purchase mocked',
        data: { strategyId: json?.strategyId, buyerAddress: json?.buyerAddress, reference: `dev_${Date.now()}` },
      })
    }

    // Forward to backend; include optional X-PAYMENT header if provided by the client
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (json?.xPayment) headers['X-PAYMENT'] = String(json.xPayment)

    const r = await fetch(`${BACKEND}/api/strategies/buy`, {
      method: 'POST',
      headers,
      body: raw,
      cache: 'no-store',
    })
    const text = await r.text()
    return new NextResponse(text, { status: r.status, headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Buy proxy failed' }, { status: 500 })
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 })
}
