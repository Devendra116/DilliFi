"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { createStrategy, ChainAddress, StrategyTrigger, ExecutionStep } from "@/lib/strategiesApi";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2, Play } from "lucide-react";

type UserLike = {
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  walletAddress?: string;
  accessToken?: string;
} | null;

export function CreateStrategyWizard({
  user,
  onStrategyCreated,
}: {
  user: UserLike;
  onStrategyCreated: (res: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dateAdded, setDateAdded] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Step 2: Trigger
  const [triggerType, setTriggerType] = useState<"price" | "time">("price");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [sourceValue, setSourceValue] = useState<string>("3000");
  const [targetValue, setTargetValue] = useState<string>("3100");
  const [assetChainId, setAssetChainId] = useState<string>("1");
  const chainOptions = [
    { id: "1", label: "Ethereum" },
    { id: "137", label: "Polygon" },
    { id: "10", label: "Optimism" },
    { id: "42161", label: "Arbitrum" },
    { id: "8453", label: "Base" },
    { id: "56", label: "BNB Smart Chain" },
    { id: "43114", label: "Avalanche C-Chain" },
  ];
  const [assetAddress, setAssetAddress] = useState<string>("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"); // WETH
  const [priceSourceUrl, setPriceSourceUrl] = useState<string>(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );
  // Time-based trigger specifics
  const [intervalMinutes, setIntervalMinutes] = useState<string>("5");
  const [startAtIso, setStartAtIso] = useState<string>(new Date().toISOString());

  // Step 3: Execution (Uniswap approval + swap)
  const [integrationType, setIntegrationType] = useState<string>("uniswap");
  const [routerAddress, setRouterAddress] = useState<string>("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"); // UniswapV2 Router (Ethereum)
  const [tokenIn, setTokenIn] = useState<string>("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"); // WETH (Ethereum)
  const [tokenOut, setTokenOut] = useState<string>("0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"); // USDC (Ethereum)
  const [amountInEth, setAmountInEth] = useState<string>("1");
  const [amountOutMin, setAmountOutMin] = useState<string>("2900"); // USDC with 6 decimals -> we'll scale below
  const [recipient, setRecipient] = useState<string>(user?.walletAddress || "");
  const [deadline, setDeadline] = useState<string>("1735689600"); // 2024-12-31
  const [slippage, setSlippage] = useState<string>("0.5");
  const [gasLimit, setGasLimit] = useState<string>("200000");

  // Advanced: Max supply, Fee, Payment mode
  const [maxSupplyToken, setMaxSupplyToken] = useState<string>("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  const [maxSupplyAmount, setMaxSupplyAmount] = useState<string>("100");
  const [feeToken, setFeeToken] = useState<string>("0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
  const [feeAmount, setFeeAmount] = useState<string>("0.1");
  const [feeRecipient, setFeeRecipient] = useState<string>(user?.walletAddress || "");
  const [paymentMode, setPaymentMode] = useState<string>("x402");

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length > 0 && desc.trim().length > 0;
    if (step === 2) {
      if (triggerType === "price") {
        return (
          condition.length > 0 &&
          !!assetAddress &&
          !!priceSourceUrl &&
          !Number.isNaN(Number(sourceValue)) &&
          !Number.isNaN(Number(targetValue))
        );
      }
      // time-based
      return !Number.isNaN(Number(intervalMinutes)) && startAtIso.length > 0;
    }
    if (step === 3) {
      return !!tokenIn && !!tokenOut && !!amountInEth && !!recipient;
    }
    return false;
  }, [step, name, desc, triggerType, condition, assetAddress, priceSourceUrl, sourceValue, targetValue, intervalMinutes, startAtIso, tokenIn, tokenOut, amountInEth, recipient]);

  function toChainAddress(address: string, chainId = assetChainId): ChainAddress {
    return { chainId: String(chainId), address: address as `0x${string}` } as any;
  }

  function toWei(eth: string): string {
    const [whole, frac = ""] = String(eth).split(".");
    const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
    const big = BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
    return big.toString();
  }

  function toTokenDecimals(amount: string, decimals: number): string {
    const [whole, frac = ""] = String(amount).split(".");
    const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
    const big = BigInt(whole || "0") * (10n ** BigInt(decimals)) + BigInt(fracPadded || "0");
    return big.toString();
  }

  function buildTriggers(): StrategyTrigger[] {
    const minutes = Math.max(1, Number(intervalMinutes) || 1);
    const cron = `*/${minutes} * * * *`;
    if (triggerType === "price") {
      return [
        {
          type: "price",
          condition,
          time: cron, // backend expects a string field `time`
          source_value: Number(sourceValue),
          target_value: Number(targetValue),
          asset: toChainAddress(assetAddress),
          source: priceSourceUrl,
        },
      ];
    }
    // time-based trigger payload (simple interval semantics)
    return [
      {
        type: "time",
        condition: "interval",
        time: cron,
        source_value: Number(intervalMinutes), // minutes
        target_value: Date.parse(startAtIso) || undefined,
        source: "interval-minutes",
      },
    ];
  }

  function buildExecutionSteps(): ExecutionStep[] {
    const path: ChainAddress[] = [toChainAddress(tokenIn), toChainAddress(tokenOut)];
    const amtIn = toWei(amountInEth);
    const amtOutMin = toTokenDecimals(amountOutMin, 6); // assuming USDC 6 decimals
    const recipientCA = toChainAddress(recipient);
    return [
      {
        integration_type: integrationType,
        integration_steps: [
          {
            step_type: "approval",
            token: toChainAddress(tokenIn),
            amount: amtIn,
            spender: toChainAddress(routerAddress),
          },
          {
            step_type: "swap",
            version: "v2",
            // We default to token-for-token since `token_in` is an ERC-20 (e.g., WETH)
            function_name: "swapExactTokensForTokens",
            token_in: toChainAddress(tokenIn),
            token_out: toChainAddress(tokenOut),
            amount_in: amtIn,
            amount_out_min: amtOutMin,
            path,
            recipient: recipientCA,
            deadline,
            extra: { slippage, gasLimit },
          },
        ],
      },
    ];
  }

  function isAddress(v: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(v || "");
  }

  function isNumberLike(v: string) {
    return v !== undefined && v !== null && !Number.isNaN(Number(v));
  }

  async function handleSubmit() {
    try {
      setError(null);
      if (!user?.walletAddress) {
        setError("Please connect your wallet to continue.");
        return;
      }
      // Basic client-side validation to prevent 400s from backend
      if (!isAddress(assetAddress)) return setError("Asset address is invalid.");
      if (!isAddress(routerAddress)) return setError("Router address is invalid.");
      if (!isAddress(tokenIn)) return setError("Token In address is invalid.");
      if (!isAddress(tokenOut)) return setError("Token Out address is invalid.");
      if (!isAddress(recipient)) return setError("Recipient address is invalid.");
      if (!isAddress(maxSupplyToken)) return setError("Max supply token address is invalid.");
      if (!isAddress(feeToken)) return setError("Fee token address is invalid.");
      if (!isAddress(feeRecipient || "")) return setError("Fee recipient must be a valid 0x address.");
      if (!isNumberLike(amountInEth)) return setError("Amount In must be a number.");
      if (!isNumberLike(amountOutMin)) return setError("Min Out must be a number.");
      if (!/^[0-9]+$/.test(deadline)) return setError("Deadline must be a unix timestamp (seconds).");
      if (!isNumberLike(slippage)) return setError("Slippage must be a number.");
      if (!/^[0-9]+$/.test(gasLimit)) return setError("Gas limit must be an integer.");

      setSubmitting(true);
      const req = {
        userAddress: user.walletAddress,
        strategy: {
          name,
          desc,
          creator: toChainAddress(user.walletAddress, assetChainId),
          triggers: buildTriggers(),
          execution_steps: buildExecutionSteps(),
          pre_conditions: [
            { type: "metadata", date_added: dateAdded },
          ],
          max_supply: { chainId: assetChainId, address: maxSupplyToken, amount: Number(maxSupplyAmount) },
          fee: { chainId: assetChainId, address: feeToken, amount: Number(feeAmount), recipient: feeRecipient || user.walletAddress },
          payment_mode: paymentMode,
        },
      };
      const res = await createStrategy(req as any);
      onStrategyCreated(res);
    } catch (e: any) {
      setError(e?.message || "Failed to create strategy");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (step / 3) * 100;
  const chainName = useMemo(() => chainOptions.find(c => c.id === assetChainId)?.label ?? `Chain ${assetChainId}`,[assetChainId]);

  function applyChainDefaults() {
    if (assetChainId === "1") {
      setRouterAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
      setTokenIn("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"); // WETH
      setTokenOut("0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"); // USDC
      setMaxSupplyToken("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
      setFeeToken("0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
      setAssetAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
      return;
    }
    if (assetChainId === "137") {
      setRouterAddress("0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"); // QuickSwap V2
      setTokenIn("0x0d500B1d8E8ef31E21C99d1Db9A6444d3ADf1270"); // WMATIC
      setTokenOut("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"); // USDC (Polygon)
      setMaxSupplyToken("0x0d500B1d8E8ef31E21C99d1Db9A6444d3ADf1270");
      setFeeToken("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
      setAssetAddress("0x0d500B1d8E8ef31E21C99d1Db9A6444d3ADf1270");
      return;
    }
    // For other chains, keep current values; users can override.
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create Strategy</h1>
          <p className="text-gray-300">Three steps to define and publish your automated strategy.</p>
        </div>

        <div className="mb-4">
          <Progress value={progress} />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span className={step >= 1 ? "text-white" : ""}>1. Basics</span>
            <span className={step >= 2 ? "text-white" : ""}>2. Triggers</span>
            <span className={step >= 3 ? "text-white" : ""}>3. Execution</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Basic Info</CardTitle>
              <CardDescription>Strategy name, description, and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Strategy Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ETH-USDC Swap Strategy" />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Automated ETH to USDC swap when ETH price goes above $3000" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date Added</Label>
                  <Input id="date" type="date" value={dateAdded} onChange={(e) => setDateAdded(e.target.value)} />
                </div>
                <div>
                  <Label>Creator Address</Label>
                  <Input value={user?.walletAddress || ""} disabled placeholder="Connect wallet" />
                </div>
                <div>
                  <Label>Chain</Label>
                  <Select value={assetChainId} onValueChange={setAssetChainId}>
                    <SelectTrigger><SelectValue placeholder="Chain" /></SelectTrigger>
                    <SelectContent>
                      {chainOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Triggers</CardTitle>
              <CardDescription>Choose when the strategy should execute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex">
                <ToggleGroup type="single" value={triggerType} onValueChange={(v) => v && setTriggerType(v as any)} variant="outline" className="bg-neutral-900 border border-neutral-800">
                  <ToggleGroupItem value="price" className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:border-emerald-500">
                    Price-based
                  </ToggleGroupItem>
                  <ToggleGroupItem value="time" className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:border-emerald-500">
                    Time-based
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {triggerType === "price" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Condition</Label>
                      <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Source Value (USD)</Label>
                      <Input value={sourceValue} onChange={(e) => setSourceValue(e.target.value)} placeholder="3000" />
                    </div>
                    <div>
                      <Label>Target Value (USD)</Label>
                      <Input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="3100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>Price Source URL</Label>
                      <Input value={priceSourceUrl} onChange={(e) => setPriceSourceUrl(e.target.value)} />
                    </div>
                    <div>
                      <Label>Asset (Token)</Label>
                      <Input value={assetAddress} onChange={(e) => setAssetAddress(e.target.value)} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Every (minutes)</Label>
                      <Input value={intervalMinutes} onChange={(e) => setIntervalMinutes(e.target.value)} placeholder="5" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Start At (ISO)</Label>
                      <Input value={startAtIso} onChange={(e) => setStartAtIso(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Execution</CardTitle>
              <CardDescription>Define the on-chain actions to execute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assetChainId !== "1" && (
                <Alert className="border-amber-800 bg-amber-900/30">
                  <AlertDescription>
                    You selected {chainName}. Please ensure router and token addresses belong to this chain.
                    {assetChainId === "137" && (
                      <span> You can also apply Polygon defaults below.</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {(assetChainId === "1" || assetChainId === "137") && (
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={applyChainDefaults}>
                    Use {chainName} defaults
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Integration</Label>
                  <Select value={integrationType} onValueChange={setIntegrationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniswap">Uniswap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Router (spender)</Label>
                  <Input value={routerAddress} onChange={(e) => setRouterAddress(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Token In (address)</Label>
                  <Input value={tokenIn} onChange={(e) => setTokenIn(e.target.value)} />
                </div>
                <div>
                  <Label>Token Out (address)</Label>
                  <Input value={tokenOut} onChange={(e) => setTokenOut(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Amount In (native)</Label>
                  <Input value={amountInEth} onChange={(e) => setAmountInEth(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <Label>Min Out (units)</Label>
                  <Input value={amountOutMin} onChange={(e) => setAmountOutMin(e.target.value)} placeholder="2900" />
                </div>
                <div>
                  <Label>Recipient</Label>
                  <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Deadline (unix)</Label>
                  <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div>
                  <Label>Slippage (%)</Label>
                  <Input value={slippage} onChange={(e) => setSlippage(e.target.value)} />
                </div>
                <div>
                  <Label>Gas Limit</Label>
                  <Input value={gasLimit} onChange={(e) => setGasLimit(e.target.value)} />
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-4">
                <h4 className="text-sm font-semibold mb-3">Advanced</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Max Supply Token</Label>
                    <Input value={maxSupplyToken} onChange={(e) => setMaxSupplyToken(e.target.value)} />
                  </div>
                  <div>
                    <Label>Max Supply Amount</Label>
                    <Input value={maxSupplyAmount} onChange={(e) => setMaxSupplyAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label>Payment Mode</Label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="x402">x402</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label>Fee Token</Label>
                    <Input value={feeToken} onChange={(e) => setFeeToken(e.target.value)} />
                  </div>
                  <div>
                    <Label>Fee Amount</Label>
                    <Input value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label>Fee Recipient</Label>
                    <Input value={feeRecipient} onChange={(e) => setFeeRecipient(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-200">Execution Preview</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>
                    Approval: Allow router {routerAddress.slice(0, 6)}…{routerAddress.slice(-4)} to spend token {tokenIn.slice(0,6)}…{tokenIn.slice(-4)} for {amountInEth} native
                  </li>
                  <li>
                    Swap: {amountInEth} in -> min {amountOutMin} out, recipient {recipient.slice(0,6)}…{recipient.slice(-4)}, deadline {deadline}
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => canNext && setStep((s) => Math.min(3, s + 1))} disabled={!canNext}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={!canNext || submitting} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
              {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting</>) : (<><Check className="w-4 h-4 mr-2" /> Create Strategy</>)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
