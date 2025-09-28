"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Dashboard } from "@/components/Dashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { ready, authenticated, user: privyUser, getAccessToken } = (usePrivy() as any);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const maybeGetToken = async () => {
      try {
        if (typeof getAccessToken === "function") {
          const token = await getAccessToken();
          setAccessToken(token ?? null);
        }
      } catch {
        // ignore if token not available
      }
    };
    if (ready && authenticated) {
      void maybeGetToken();
    }
  }, [ready, authenticated, getAccessToken]);

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
      walletAddress: privyUser?.wallet?.address || privyUser?.wallets?.[0]?.address,
      accessToken: accessToken || undefined,
    };
  }, [ready, authenticated, privyUser, accessToken]);

  // Wire child navigation to routes
  const onViewChange = (view: string) => {
    switch (view) {
      case "home":
        router.push("/");
        break;
      case "marketplace":
        router.push("/marketplace");
        break;
      case "create":
        router.push("/create-stragety");
        break;
      case "dashboard":
        router.push("/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  return <Dashboard user={user} onViewChange={onViewChange} />;
}
