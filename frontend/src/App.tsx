import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { Marketplace } from "./components/Marketplace";
import { CreateStrategy } from "./components/CreateStrategy";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const {
    ready,
    authenticated,
    user: privyUser,
    getAccessToken,
  } = usePrivy() as any;
  const { login } = useLogin();
  const { logout } = useLogout();

  // Map Privy user into app's expected shape
  useEffect(() => {
    if (!ready) return;
    if (authenticated && privyUser) {
      const mapped = {
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
        accessToken: accessToken || undefined,
      };
      setUser(mapped);
    } else {
      setUser(null);
      setAccessToken(null);
    }
  }, [ready, authenticated, privyUser, accessToken]);

  // Fetch Privy access token when authenticated
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

  const handleLogin = async () => {
    await login();
    toast.success("Successfully signed in!");
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView("home");
    toast.success("Successfully signed out!");
  };

  const handleShowAuth = async () => {
    await login();
  };

  const handleViewChange = (view: string) => {
    // Redirect to auth if user tries to access protected routes
    if ((view === "create" || view === "dashboard") && !user) {
      void login();
      return;
    }
    setCurrentView(view);
  };

  const handlePurchaseStrategy = (strategyId: string) => {
    if (!user) {
      toast.error("Please sign in to purchase strategies");
      void login();
      return;
    }

    // Simulate purchase process
    toast.loading("Processing purchase...", { id: "purchase" });

    setTimeout(() => {
      toast.success("Strategy purchased successfully!", { id: "purchase" });
      // In a real app, you would call the purchase API here
    }, 2000);
  };

  const handleStrategyCreated = (strategy: any) => {
    toast.success("Strategy created and deployed successfully!");
    setCurrentView("dashboard");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return <HomePage onViewChange={handleViewChange} />;
      case "marketplace":
        return <Marketplace user={user} onPurchase={handlePurchaseStrategy} />;
      case "create":
        return (
          <CreateStrategy
            user={user}
            onStrategyCreated={handleStrategyCreated}
          />
        );
      case "dashboard":
        return <Dashboard user={user} onViewChange={handleViewChange} />;
      default:
        return <HomePage onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        user={user}
        onLogin={handleShowAuth}
        onLogout={handleLogout}
      />
      <main>{renderCurrentView()}</main>

      <Toaster position="top-right" />
    </div>
  );
}
