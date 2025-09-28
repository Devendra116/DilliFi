import { NextResponse, type NextRequest } from 'next/server'
import { paymentMiddleware } from 'x402-next'
import type { RoutesConfig, FacilitatorConfig } from 'x402/types'

// Environment-driven configuration so this works across envs without code changes
const PAY_TO = process.env.X402_PAY_TO || process.env.NEXT_PUBLIC_X402_PAY_TO || ''
const NETWORK = (process.env.X402_NETWORK || 'base-sepolia') as 'base' | 'base-sepolia'
// PRICE can be like "$0.01" or a numeric string amount in atomic units with an asset config
const PRICE = process.env.X402_PRICE || '$0.01'
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || process.env.NEXT_PUBLIC_FACILITATOR_URL
const FACILITATOR_TOKEN = process.env.X402_FACILITATOR_TOKEN

const routes: RoutesConfig = {
  'POST /api/strategies/buy': {
    price: PRICE as any,
    network: NETWORK,
    config: {
      description: 'Purchase strategy',
      mimeType: 'application/json',
    },
  },
}

const facilitator: FacilitatorConfig | undefined = FACILITATOR_URL
  ? {
      url: FACILITATOR_URL,
      createAuthHeaders: async () => {
        const headers = FACILITATOR_TOKEN ? { Authorization: `Bearer ${FACILITATOR_TOKEN}` } : {}
        return { verify: headers, settle: headers }
      },
    }
  : undefined

// If PAY_TO is not configured, fall back to a no-op middleware so the app still works.
export const middleware = PAY_TO
  ? paymentMiddleware(PAY_TO as `0x${string}`, routes, facilitator)
  : ((req: NextRequest) => NextResponse.next())

// Run only on API routes we care about
export const config = {
  matcher: ['/api/strategies/:path*'],
}

