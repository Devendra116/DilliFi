import type { Metadata } from 'next'
import { Providers } from './providers'
import '../src/index.css'
import '../src/styles/globals.css'
import HeaderClient from './HeaderClient'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Web3 Financial Strategy Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <Providers>
          <HeaderClient />
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
