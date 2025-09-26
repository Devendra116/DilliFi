"use client";

import { usePrivy } from "@privy-io/react-auth";
import GlassCard from "@/components/ui/glass-card";
import React from "react";

export default function AuthCard() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Loading / initializing
  if (!ready) {
    return (
      <GlassCard>
        <span className="muted">Initializing…</span>
      </GlassCard>
    );
  }

  // If Privy app id is missing, show a hint
  if ((globalThis as any).PRIVY_APP_ID === undefined && process.env.NEXT_PUBLIC_PRIVY_APP_ID === undefined) {
    return (
      <GlassCard>
        <span className="muted">Set NEXT_PUBLIC_PRIVY_APP_ID to enable auth</span>
      </GlassCard>
    );
  }

  if (!authenticated) {
    return (
      <GlassCard>
        <button className="btn pill" onClick={() => login()}>
          Connect / Sign in
        </button>
      </GlassCard>
    );
  }

  const display = user?.wallet?.address
    ? shortenAddress(user.wallet.address)
    : user?.email?.address ?? "Signed in";

  return (
    <GlassCard>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 10, height: 10, borderRadius: 999, background: "#35d07f"
        }} />
        <span style={{ fontWeight: 600 }}>{display}</span>
        <button className="btn" style={{ marginLeft: 8 }} onClick={() => logout()}>
          Logout
        </button>
      </div>
    </GlassCard>
  );
}

function shortenAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

