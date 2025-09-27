"use client";

import { ThemeProvider } from "next-themes";
import { PrivyProvider } from "@privy-io/react-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["wallet"],
        appearance: { theme: "dark" },
        embeddedWallets: { createOnLogin: "users-without-wallets" },
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
      >
        {children}
      </ThemeProvider>
    </PrivyProvider>
  );
}
