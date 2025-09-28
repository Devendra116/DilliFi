"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";

export default function HeaderClient() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, authenticated, user: privyUser, getAccessToken } = (usePrivy() as any);
  const { login } = useLogin();
  const { logout } = useLogout();
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

  const currentView = useMemo(() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/marketplace")) return "marketplace";
    if (pathname.startsWith("/create-stragety") || pathname.startsWith("/create-strategy")) return "create";
    if (pathname.startsWith("/dashboard")) return "dashboard";
    return "home";
  }, [pathname]);

  const onViewChange = (view: string) => {
    switch (view) {
      case "home":
        router.push("/");
        break;
      case "marketplace":
        router.push("/marketplace");
        break;
      case "create":
        // Require auth for create/dashboard
        if (!user) {
          void login();
          return;
        }
        router.push("/create-stragety");
        break;
      case "dashboard":
        if (!user) {
          void login();
          return;
        }
        router.push("/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  const onLogin = async () => {
    await login();
  };

  const onLogout = async () => {
    await logout();
  };

  return (
    <Header
      currentView={currentView}
      onViewChange={onViewChange}
      user={user}
      onLogin={onLogin}
      onLogout={onLogout}
    />
  );
}

