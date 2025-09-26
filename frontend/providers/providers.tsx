"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import React from "react";

type ProvidersProps = {
  children: React.ReactNode;
  privyAppId: string;
};

export default function Providers({ children, privyAppId }: ProvidersProps) {
  // If no appId is set yet, we still render children so the page loads,
  // but the auth card will show a helpful message.
  const hasAppId = Boolean(privyAppId);

  return (
    <PrivyProvider
      appId={hasAppId ? privyAppId : "missing-app-id"}
      config={{
        // Customize Privy as desired
        loginMethods: ["wallet"],
        appearance: {
          theme: "dark",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
