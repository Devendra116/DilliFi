"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Clock, DollarSign, Star, TrendingUp, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { ensureSession, executePayment } from "@/lib/x402";
import { buyStrategy, type StrategyPayload } from "@/lib/strategiesApi";
import type { Strategy } from "@/components/Marketplace";

// Fallback dataset if direct import changes later — keeps page self-contained
const FALLBACK: Strategy[] = [
  {
    id: "1",
    name: "DeFi Yield Maximizer",
    description:
      "Automatically compounds yields across multiple DeFi protocols for maximum returns.",
    creator: "CryptoAlpha",
    creatorAvatar: "/api/placeholder/40/40",
    category: "Yield Farming",
    performance: "+127.3%",
    performanceValue: 127.3,
    risk: "Medium",
    price: "0.5 ETH",
    priceUSD: "$1,250",
    rating: 4.8,
    users: 1240,
    totalValue: "$2.4M",
    createdAt: "2024-01-15",
    tags: ["DeFi", "Yield", "Auto-compound"],
    verified: true,
  },
  {
    id: "2",
    name: "Arbitrage Hunter",
    description:
      "Exploits price differences across exchanges for consistent, low-risk profits.",
    creator: "QuantTrader",
    creatorAvatar: "/api/placeholder/40/40",
    category: "Arbitrage",
    performance: "+89.1%",
    performanceValue: 89.1,
    risk: "Low",
    price: "0.3 ETH",
    priceUSD: "$750",
    rating: 4.9,
    users: 856,
    totalValue: "$1.8M",
    createdAt: "2024-02-01",
    tags: ["Arbitrage", "Low-risk", "CEX-DEX"],
    verified: true,
  },
  {
    id: "3",
    name: "Momentum Scalper",
    description:
      "High-frequency trading strategy that captures small price movements.",
    creator: "TechAnalyst",
    creatorAvatar: "/api/placeholder/40/40",
    category: "Scalping",
    performance: "+156.7%",
    performanceValue: 156.7,
    risk: "High",
    price: "0.8 ETH",
    priceUSD: "$2,000",
    rating: 4.6,
    users: 634,
    totalValue: "$3.1M",
    createdAt: "2024-01-10",
    tags: ["Scalping", "High-frequency", "Technical"],
    verified: false,
  },
];

export default function StrategyDetailsPage() {
  const params = useParams<{ id: string }>();
  const { ready, authenticated, user: privyUser } = usePrivy() as any;

  const user = useMemo(() => {
    if (!ready || !authenticated || !privyUser) return null;
    return {
      id: privyUser.id,
      email: privyUser?.email?.address ?? undefined,
      name:
        privyUser?.google?.name ||
        privyUser?.twitter?.username ||
        privyUser?.email?.address ||
        "User",
      avatar:
        privyUser?.google?.pictureUrl ||
        privyUser?.twitter?.profilePictureUrl ||
        undefined,
      walletAddress:
        privyUser?.wallet?.address || privyUser?.wallets?.[0]?.address,
    };
  }, [ready, authenticated, privyUser]);

  const strategy: Strategy | undefined = useMemo(
    () => FALLBACK.find((s) => s.id === String(params.id)),
    [params.id]
  );

  const [executing, setExecuting] = useState(false);

  const handlePurchase = async () => {
    if (!user?.walletAddress || !strategy) {
      toast.error("Please sign in to purchase strategies");
      return;
    }
    try {
      setExecuting(true);
      await ensureSession();

      const payload: StrategyPayload = {
        name: strategy.name,
        desc: strategy.description,
        creator: { chainId: "1", address: user.walletAddress },
        triggers: [
          {
            type: "price",
            condition: "above",
            source_value: 3000,
            target_value: 3100,
            asset: { chainId: "1", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
            source:
              "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
          },
        ],
        execution_steps: [
          {
            integration_type: "uniswap",
            integration_steps: [
              {
                step_type: "approval",
                token: { chainId: "1", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
                amount: "1000000000000000000",
                spender: { chainId: "1", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
              },
              {
                step_type: "swap",
                version: "v2",
                function_name: "swapExactETHForTokens",
                token_in: { chainId: "1", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
                token_out: { chainId: "1", address: "0xA0b86a33E6E8c3c4e8a6C8d7f2b4A6f5B4A2cDcE" },
                amount_in: "1000000000000000000",
                amount_out_min: "2900000000",
                path: [
                  { chainId: "1", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
                  { chainId: "1", address: "0xA0b86a33E6E8c3c4e8a6C8d7f2b4A6f5B4A2cDcE" },
                ],
                recipient: { chainId: "1", address: user.walletAddress },
                deadline: "1735689600",
                extra: { slippage: "0.5", gasLimit: "200000" },
              },
            ],
          },
        ],
        pre_conditions: [],
        max_supply: {
          chainId: "1",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          amount: 100,
        },
        fee: {
          chainId: "1",
          address: "0xA0b86a33E6E8c3c4e8a6C8d7f2b4A6f5B4A2cDcE",
          amount: 0.1,
          recipient: user.walletAddress,
        },
        payment_mode: "x402",
      };

      const receipt = await executePayment({ amount: "0", currency: "ETH", description: strategy.name });
      if (!receipt.ok) throw new Error("Payment failed");

      await buyStrategy({ userAddress: user.walletAddress, strategy: payload });
      toast.success("Strategy executed via x402 and queued for execution");
    } catch (e: any) {
      toast.error(e?.message || "Execution failed");
    } finally {
      setExecuting(false);
    }
  };

  if (!strategy) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Strategy not found</CardTitle>
              <CardDescription>
                The strategy you’re looking for does not exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/marketplace">
                <Button>Back to Marketplace</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-bg min-h-screen bg-neutral-950 text-neutral-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 gap-3">
              <AvatarImage
                src={strategy.creatorAvatar}
                alt={strategy.creator}
              />
              <AvatarFallback className="mr-3">
                {strategy.creator.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {strategy.name}
                {strategy.verified && (
                  <Shield className="w-5 h-5 text-orange-500" />
                )}
              </h1>
              <p className="text-sm text-gray-400">
                by {strategy.creator} •{" "}
                {new Date(strategy.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link href="/marketplace">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>{strategy.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-gray-200">
                  {strategy.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {strategy.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Key metrics and usage</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Performance</span>
                  </div>
                  <p className="font-semibold text-green-500">
                    {strategy.performance}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Total Value</span>
                  </div>
                  <p className="font-semibold">{strategy.totalValue}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{strategy.rating}</span>
                  <span className="text-gray-400">
                    ({strategy.users} users)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(strategy.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{strategy.price}</p>
                    <p className="text-sm text-gray-400">{strategy.priceUSD}</p>
                  </div>
                  <Badge variant="outline">{strategy.category}</Badge>
                </div>
                <Button
                  style={{ background: "rgb(255, 122, 0)" }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  onClick={handlePurchase}
                  disabled={executing}
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing…
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" /> Execute via x402
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What you get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Immediate access to strategy parameters</li>
                  <li>Updates from the creator</li>
                  <li>Support via platform messages</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
