# Frontend (Next.js + Privy)

Modular Next.js 14 + TypeScript app with Privy authentication and a glass-style auth card anchored to the top-right, similar to Uniswap.

## Setup

1. Install dependencies:

   - npm: `npm install`
   - pnpm: `pnpm install`
   - yarn: `yarn`

2. Configure Privy:

   - Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_PRIVY_APP_ID` to your Privy app id.

3. Run the dev server:

   - `npm run dev` (or `pnpm dev` / `yarn dev`)

The auth card appears in the top-right. When unauthenticated, it shows a "Connect / Sign in" button; when authenticated, it shows your connected wallet or email and a logout button.

## Project Structure

- `app/` — App Router pages and layout
  - `layout.tsx` — wraps content with the Privy provider and header
  - `page.tsx` — sample landing
- `providers/` — client-side providers (e.g., `PrivyProvider`)
- `components/`
  - `auth/auth-card.tsx` — top-right glass auth card
  - `ui/glass-card.tsx` — reusable glass container
- `app/globals.css` — theme + glass styles

## Notes

- Set `NEXT_PUBLIC_PRIVY_APP_ID` to enable Privy auth.
- Glass UI uses `backdrop-filter`, which needs browser support.

