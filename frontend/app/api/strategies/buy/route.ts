import { NextRequest, NextResponse } from 'next/server'
// Integrate x402 payments for 402 challenges
// See: https://vercel.com/blog/introducing-x402-mcp-open-protocol-payments-for-mcp-tools
// We wrap the route handler with paymentMiddleware so 402 responses
// from the backend trigger the x402 flow and get retried automatically.
// Note: ensure the `x402-next` package is installed in the app.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types depend on x402-next package
import { paymentMiddleware } from 'x402-next'

const BACKEND = (process.env.BACKEND_ORIGIN || 'https://ethglobal-delhi.onrender.com').replace(/\/$/, '')

async function postImpl(req: NextRequest) {
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
    // Allow either request header or JSON body to carry the payment reference
    const hdrPayment = req.headers.get('x-payment') || req.headers.get('X-PAYMENT')
    if (hdrPayment) headers['X-PAYMENT'] = String(hdrPayment)
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

// Wrap with x402 payment handling middleware
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types depend on x402-next package
export const POST = paymentMiddleware(postImpl)

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 })
}
