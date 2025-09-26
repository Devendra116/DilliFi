import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/providers";
import AuthCard from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "ETHGlobal Delhi — Frontend",
  description: "Modular Next.js app with Privy auth and glass UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  return (
    <html lang="en">
      <body>
        <Providers privyAppId={privyAppId}>
          <div className="container">
            <header className="header">
              <div className="brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5Z" fill="url(#g)"/>
                  <defs>
                    <linearGradient id="g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6F7CF7"/>
                      <stop offset="1" stopColor="#C15CF3"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span>ETHGlobal Delhi</span>
              </div>
            </header>

            <main className="main">
              {children}
            </main>

            <div className="topRightFixed">
              <AuthCard />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

