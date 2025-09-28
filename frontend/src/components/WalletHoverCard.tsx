"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Copy,
  ExternalLink,
  LogOut,
  Loader2,
  Wallet,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "./ui/utils";

type TokenBalance = {
  symbol: string;
  name?: string;
  amount: string; // formatted
  logo?: string | null;
};

function shorten(address?: string, n = 4) {
  if (!address) return "";
  return address.slice(0, 2 + n) + "…" + address.slice(-n);
}

async function fetchAlchemyBalances(address: string, apiKey: string) {
  const endpoint = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  const headers = { "content-type": "application/json" };

  const [nativeRes, tokensRes] = await Promise.all([
    fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    }),
    fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "alchemy_getTokenBalances",
        params: [address, "DEFAULT_TOKENS"],
      }),
    }),
  ]);

  const nativeJson = await nativeRes.json();
  const tokensJson = await tokensRes.json();

  const nativeWei = BigInt(nativeJson?.result ?? "0x0");
  const nativeFormatted = Number(nativeWei) / 1e18;

  const tokenBalances: Array<{
    contractAddress: string;
    tokenBalance: string;
  }> = tokensJson?.result?.tokenBalances ?? [];
  const filtered = tokenBalances.filter(
    (t) => t.tokenBalance && t.tokenBalance !== "0x0"
  );

  // Fetch metadata per token
  const metas = await Promise.all(
    filtered.map((t, i) =>
      fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 100 + i,
          method: "alchemy_getTokenMetadata",
          params: [t.contractAddress],
        }),
      })
        .then((r) => r.json())
        .catch(() => null)
    )
  );

  const tokens: TokenBalance[] = filtered.map((t, i) => {
    const meta = metas[i]?.result ?? {};
    const decimals = Number(meta?.decimals ?? 18);
    let amount = "0";
    try {
      const raw = BigInt(t.tokenBalance);
      amount = (Number(raw) / Math.pow(10, decimals)).toFixed(4);
    } catch {
      amount = "0";
    }
    return {
      symbol: meta?.symbol ?? "TOKEN",
      name: meta?.name,
      logo: meta?.logo ?? null,
      amount,
    };
  });

  // Native ETH first
  const all: TokenBalance[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: nativeFormatted.toFixed(4),
      logo: null,
    },
    ...tokens
      .filter((t) => Number(t.amount) > 0)
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10),
  ];
  return all;
}

async function fetchCovalentBalances(address: string, apiKey: string) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?nft=false&no-nft-fetch=true&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Covalent balance fetch failed");
  const json = await res.json();
  const items = json?.data?.items ?? [];
  const tokens: TokenBalance[] = items
    .filter((it: any) => Number(it.balance) > 0)
    .map((it: any) => {
      const decimals = Number(it.contract_decimals ?? 18);
      let amount = "0";
      try {
        amount = (Number(it.balance) / Math.pow(10, decimals)).toFixed(4);
      } catch {
        amount = "0";
      }
      return {
        symbol: it.contract_ticker_symbol ?? "TOKEN",
        name: it.contract_name,
        logo: it.logo_url,
        amount,
      } as TokenBalance;
    })
    .sort(
      (a: TokenBalance, b: TokenBalance) => Number(b.amount) - Number(a.amount)
    )
    .slice(0, 12);
  return tokens;
}

export function WalletHoverCard({
  address,
  onDisconnect,
}: {
  address?: string;
  onDisconnect: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);

  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const covalentKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!address) return;
      setLoading(true);
      setError(null);
      try {
        let balances: TokenBalance[] = [];
        if (covalentKey) {
          balances = await fetchCovalentBalances(address, covalentKey);
        } else if (alchemyKey) {
          balances = await fetchAlchemyBalances(address, alchemyKey);
        } else {
          throw new Error(
            "Set NEXT_PUBLIC_COVALENT_API_KEY or NEXT_PUBLIC_ALCHEMY_API_KEY"
          );
        }
        if (mounted) setTokens(balances);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to load balances");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [address, alchemyKey, covalentKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white icon-tile">
            <Wallet className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Connected Wallet</span>
            <span className="text-xs text-muted-foreground">
              {shorten(address, 6)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => address && navigator.clipboard.writeText(address)}
            title="Copy address"
          >
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild title="View on Etherscan">
            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="border rounded-md p-2">
        <div className="text-xs text-muted-foreground mb-1">Balances</div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading balances…
          </div>
        ) : error ? (
          <div className="text-xs text-destructive">{error}</div>
        ) : tokens.length === 0 ? (
          <div className="text-xs text-muted-foreground">No balances found</div>
        ) : (
          <ul className="max-h-56 overflow-auto space-y-1">
            {tokens.map((t, idx) => (
              <li
                key={`${t.symbol}-${idx}`}
                className="flex items-center justify-between gap-3 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {t.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.logo}
                      alt={t.symbol}
                      className="size-4 rounded"
                    />
                  ) : (
                    <div className="size-4 rounded bg-gray-200" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {t.symbol}
                  </span>
                </div>
                <span className="text-sm tabular-nums">{t.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={onDisconnect}>
          <LogOut className="size-4 mr-2" /> Disconnect
        </Button>
      </div>
    </div>
  );
}

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function WalletPopover({
  user,
  onLogout,
  onViewChange,
}: {
  user: { walletAddress?: string; id?: string };
  onLogout: () => void;
  onViewChange: (view: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          style={{ color: "black", background: "#FF7A00" }}
          className="h-9 rounded-full px-3 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
          onMouseEnter={() => setOpen(true)}
          onClick={() => setOpen((v) => !v)}
        >
          <Wallet style={{ color: "black" }} className="w-4 h-4" />
          <span className="font-medium">
            {shorten(user.walletAddress || user.id, 6)}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Wallet balances + copy + disconnect */}
        <WalletHoverCard address={user.walletAddress} onDisconnect={onLogout} />

        {/* Extra actions */}
        <div className="mt-3 pt-3 border-t flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("profile")}
          >
            <User className="w-4 h-4 mr-2" /> Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("dashboard")}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
