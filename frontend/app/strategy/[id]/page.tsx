"use client";

import { useEffect, useMemo } from "react";
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
import {
  BarChart3,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { ensureSession, executePayment } from "@/lib/x402";
import { buyStrategy, listStrategies, getUserPurchases } from "@/lib/strategiesApi";
// import type { Strategy } from "@/components/Marketplace";

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

  const [doc, setDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const strategy: any | undefined = doc?.strategy;
  const creatorAddr = strategy?.creator?.address || doc?.userAddress || "";
  const creatorDisplay = creatorAddr
    ? `${creatorAddr.slice(0, 6)}…${creatorAddr.slice(-4)}`
    : "Unknown";
  const createdAt = doc?.createdAt || new Date().toISOString();
  const tags: string[] = Array.isArray(strategy?.triggers)
    ? (strategy.triggers.map((t: any) => t?.type).filter(Boolean) as string[])
    : [];
  const category = strategy?.execution_steps?.[0]?.integration_type || "Custom";
  const price =
    typeof strategy?.fee?.amount === "number"
      ? `${strategy.fee.amount} TOKEN`
      : strategy?.price || "—";
  const priceUSD = strategy?.priceUSD || "";
  const performance = strategy?.performance ?? "New";
  const totalValue = strategy?.totalValue ?? "$0";
  const rating = strategy?.rating ?? 0;
  const usersCount = strategy?.users ?? 0;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const all: any[] = await listStrategies();
        const found = all.find(
          (it: any) => String(it._id) === String(params.id)
        );
        setDoc(found || null);
      } catch {
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const [executing, setExecuting] = useState(false);
  const [stage, setStage] = useState<"idle" | "paying" | "queuing" | "success">("idle");
  const [purchased, setPurchased] = useState<boolean>(false);

  // Check if this strategy is already purchased by the user
  useEffect(() => {
    const checkPurchased = async () => {
      try {
        if (!user?.walletAddress) return;
        const res: any = await getUserPurchases(user.walletAddress);
        const arr = res?.data?.purchases ?? res?.purchases ?? res ?? [];
        const ids = (Array.isArray(arr) ? arr : [])
          .map((p: any) =>
            String(
              p?.strategyId ??
                p?.strategy_id ??
                p?.strategy?._id ??
                p?.strategy?.id ??
                p?.strategy ??
                ""
            )
          )
          .filter(Boolean);
        const currentId = String(doc?._id ?? doc?.id ?? params.id);
        setPurchased(ids.includes(currentId));
      } catch {
        // ignore errors on purchased check
      }
    };
    checkPurchased();
  }, [user?.walletAddress, doc?._id, doc?.id, params.id]);

  const handlePurchase = async () => {
    if (!user?.walletAddress || !strategy) {
      toast.error("Please sign in to purchase strategies");
      return;
    }
    try {
      setExecuting(true);
      setStage("paying");
      const toastId = "x402-purchase";
      toast.loading("Processing payment via x402…", { id: toastId });
      await ensureSession();
      const receipt = await executePayment({
        amount: "0",
        currency: "ETH",
        description: strategy.name,
      });
      if (!receipt.ok) throw new Error("Payment failed");

      setStage("queuing");
      toast.message("Payment confirmed. Queuing strategy…", { id: toastId });

      const strategyId = String(doc?._id ?? doc?.id ?? params.id);
      await buyStrategy({ buyerAddress: user.walletAddress, strategyId });
      setPurchased(true);
      setStage("success");
      toast.success("Queued and executing. You’ll be notified on completion.", {
        id: toastId,
      });
    } catch (e: any) {
      toast.error(e?.message || "Execution failed");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Loading strategy…</CardTitle>
              <CardDescription>Please wait a moment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching details
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                src={strategy.creatorAvatar || "/api/placeholder/40/40"}
                alt={creatorDisplay}
              />
              <AvatarFallback className="mr-3">
                {creatorDisplay.charAt(0)}
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
                by {creatorDisplay} • {new Date(createdAt).toLocaleDateString()}
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
                <CardDescription>{category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-gray-200">{strategy.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
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
                  <p className="font-semibold text-green-500">{performance}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Total Value</span>
                  </div>
                  <p className="font-semibold">{totalValue}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{rating}</span>
                  <span className="text-gray-400">({usersCount} users)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(createdAt).toLocaleDateString()}</span>
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
                    <p className="font-semibold text-lg">{price}</p>
                    <p className="text-sm text-gray-400">{priceUSD}</p>
                  </div>
                  <Badge variant="outline">{category}</Badge>
                </div>
                <Button
                  style={{ background: "rgb(255, 122, 0)" }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  onClick={handlePurchase}
                  disabled={executing || purchased}
                >
                  {purchased ? (
                    <>Purchased</>
                  ) : executing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {stage === "paying" ? "Processing payment…" : "Queuing…"}
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" /> Execute via x402
                    </>
                  )}
                </Button>
                {(executing || stage === "success") && (
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    {executing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {stage === "paying"
                          ? "Awaiting payment confirmation…"
                          : "Queuing strategy for execution…"}
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-orange-500" />
                        Queued and executing
                      </>
                    )}
                  </div>
                )}
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
