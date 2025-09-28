import { NextRequest, NextResponse } from "next/server";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Minimal Polygon Amoy chain config (viem v1 compatible)
const polygonAmoy = {
  id: 80002,
  name: "Polygon Amoy",
  network: "polygon-amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-amoy.polygon.technology"] },
    public: { http: ["https://rpc-amoy.polygon.technology"] },
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" },
  },
  testnet: true as const,
} as const;

const BACKEND = (
  process.env.BACKEND_ORIGIN || "https://ethglobal-delhi.onrender.com"
).replace(/\/$/, "");

async function postImpl(req: NextRequest) {
  try {
    // Build a wallet client for Polygon Amoy using server PRIVATE_KEY
    const pk = process.env.PRIVATE_KEY;
    if (!pk) {
      return NextResponse.json(
        { success: false, error: "Server PRIVATE_KEY not configured" },
        { status: 500 }
      );
    }
    const account = privateKeyToAccount(pk.startsWith("0x") ? (pk as `0x${string}`) : (`0x${pk}` as `0x${string}`));
    const walletClient = createWalletClient({ account, chain: polygonAmoy, transport: http() });
    const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient);

    const raw = await req.text();
    let json: any = undefined;
    try {
      json = raw ? JSON.parse(raw) : undefined;
    } catch {
      /* ignore */
    }

    // Forward to backend; include optional X-PAYMENT header if provided by the client
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    // Allow either request header or JSON body to carry the payment reference
    const hdrPayment =
      req.headers.get("x-payment") || req.headers.get("X-PAYMENT");
    if (hdrPayment) headers["X-PAYMENT"] = String(hdrPayment);
    if (json?.xPayment) headers["X-PAYMENT"] = String(json.xPayment);
    const r = await fetchWithPayment(`${BACKEND}/api/strategies/buy`, {
      method: "POST",
      headers,
      body: raw,
      cache: "no-store",
    });
    const text = await r.text();
    try {
      const payRespHeader = r.headers.get("x-payment-response");
      if (payRespHeader) {
        const decoded = decodeXPaymentResponse(payRespHeader);
        console.log("x402 payment settled:", decoded);
      }
    } catch {}
    console.log("buy response", r.status, text);
    return new NextResponse(text, {
      status: r.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Buy proxy failed" },
      { status: 500 }
    );
  }
}

// Wrap with x402 payment handling middleware
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types depend on x402-next package
export const POST = postImpl;

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
