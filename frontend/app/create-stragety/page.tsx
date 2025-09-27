"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { CreateStrategy } from "@/components/CreateStrategy";
import { toast } from "sonner";

export default function CreateStrategyPage() {
  const router = useRouter();
  const { ready, authenticated, user: privyUser, getAccessToken } = (usePrivy() as any);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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

  const handleStrategyCreated = () => {
    toast.success("Strategy created and deployed successfully!");
    router.push("/dashboard");
  };

  return <CreateStrategy user={user} onStrategyCreated={handleStrategyCreated} />;
}

