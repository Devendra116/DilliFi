declare module "x402-express" {
  import { Request, Response, NextFunction } from "express";

  export type SupportedNetwork =
    | "base-sepolia"
    | "base"
    | "avalanche-fuji"
    | "avalanche"
    | "iotex"
    | "solana-devnet"
    | "solana"
    | "sei"
    | "sei-testnet"
    | "polygon"
    | "polygon-amoy";

  export interface RouteConfig {
    price: string;
    network: SupportedNetwork;
    config?: {
      description?: string;
      inputSchema?: {
        type: string;
        properties?: Record<string, any>;
      };
    };
  }

  export interface RoutesConfig {
    [route: string]: RouteConfig;
  }

  export interface FacilitatorConfig {
    url?: string;
    createAuthHeaders?: () => Promise<{
      verify?: Record<string, string>;
      settle?: Record<string, string>;
    }>;
  }

  export interface PaywallConfig {
    cdpClientKey?: string;
    appLogo?: string;
    appName?: string;
  }

  export function paymentMiddleware(
    payTo: `0x${string}`,
    routes: RoutesConfig | RouteConfig,
    facilitator?: FacilitatorConfig,
    paywall?: PaywallConfig
  ): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}