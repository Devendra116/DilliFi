import { Request, Response, NextFunction } from "express";
import {
  getStrategyFeeConfig,
  formatX402Price,
} from "../utils/strategyFeeHandler";
import { paymentMiddleware, RouteConfig, SupportedNetwork } from "x402-express";

// Type declaration for x402-express
// declare const require: any;
// const { paymentMiddleware } = require("x402-express");

export interface X402StrategyRequest extends Request {
  strategyFeeData?: {
    amount: number;
    recipient: string;
    chainId: string;
    tokenAddress: string;
    currency: string;
  };
}

export function validateBuyStrategyBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { strategyId, buyerAddress } = req.body;

  // Validate strategyId
  if (!strategyId || typeof strategyId !== "string") {
    return res.status(400).json({
      success: false,
      error: "strategyId is required and must be a string",
    });
  }

  // Validate buyerAddress
  if (!buyerAddress || typeof buyerAddress !== "string") {
    return res.status(400).json({
      success: false,
      error: "buyerAddress is required and must be a string",
    });
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(buyerAddress)) {
    return res.status(400).json({
      success: false,
      error: "Invalid buyerAddress format. Must be a valid Ethereum address (0x...)",
    });
  }

  return next();
}

interface X402Config {
  price: string;
  network: SupportedNetwork;
  config: {
    description: string;
    inputSchema: {
      type: string;
      properties: {
        buyerAddress: {
          type: string;
          description: string;
        };
      };
    };
  };
}

export function generateX402ConfigForStrategy(strategyFeeData: {
  amount: number;
  recipient: string;
  currency: string;
}): X402Config {
  const defaultNetwork: SupportedNetwork = "polygon-amoy";
  const envNetwork = process.env.X402_NETWORK as SupportedNetwork;
  const supportedNetworks: SupportedNetwork[] = [
    "base-sepolia",
    "base",
    "avalanche-fuji",
    "avalanche",
    "iotex",
    "solana-devnet",
    "solana",
    "sei",
    "sei-testnet",
    "polygon",
    "polygon-amoy",
  ];

  return {
    price: `$${strategyFeeData.amount}`,
    network:
      envNetwork && supportedNetworks.includes(envNetwork)
        ? envNetwork
        : defaultNetwork,
    config: {
      description: "Purchase DeFi Strategy",
      inputSchema: {
        type: "object",
        properties: {
          buyerAddress: {
            type: "string",
            description: "Ethereum address of the strategy buyer",
          },
        },
      },
    },
  };
}

export function createDynamicX402RouteConfig(
  strategyId: string,
  strategyFeeData: any
) {
  const x402Config = generateX402ConfigForStrategy(strategyFeeData);

  // Return configuration in the format expected by x402-express
  return x402Config;
}

// Convert the old middleware function to a regular async function
export async function fetchStrategyFeeData(strategyId: string) {
  try {
    const strategyFeeData = await getStrategyFeeConfig(strategyId);

    if (!strategyFeeData) {
      throw new Error("Strategy not found");
    }

    return strategyFeeData;
  } catch (error: any) {
    console.error("Error fetching strategy fee data:", error);
    throw error;
  }
}

// Dynamic global X402 middleware function
export function createDynamicX402Middleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only apply X402 middleware to the strategy buy route
      if (req.method === 'POST' && req.path === '/strategies/buy') {
        console.log("=== Dynamic X402 Middleware Triggered ===");
        console.log("Request body:", req.body);

        const { strategyId, buyerAddress } = req.body;

        // Validate required fields are present
        if (!strategyId || !buyerAddress) {
          console.log("Missing strategyId or buyerAddress, skipping X402 processing");
          return next();
        }

        console.log("Fetching strategy fee data for:", strategyId);

        // Fetch strategy fee data
        let strategyFeeData;
        try {
          strategyFeeData = await fetchStrategyFeeData(strategyId);
        } catch (error: any) {
          console.error("Failed to fetch strategy fee data:", error);
          // If we can't fetch strategy data, let the request proceed
          // The route handler will handle the error appropriately
          return next();
        }

        console.log("Strategy fee data fetched:", strategyFeeData);

        // Create dynamic X402 middleware with strategy-specific configuration
        const dynamicX402Middleware = paymentMiddleware(
          strategyFeeData.recipient as `0x${string}`,
          {
            "POST /api/strategies/buy": {
              price: `$${strategyFeeData.amount}`,
              network: 'polygon-amoy', // Fixed network as requested
              config: {
                description: `Purchase DeFi Strategy (${strategyId})`,
                inputSchema: {
                  type: "object",
                  properties: {
                    strategyId: {
                      type: "string",
                      description: "ID of the strategy to purchase",
                    },
                    buyerAddress: {
                      type: "string",
                      description: "Ethereum address of the strategy buyer",
                    },
                  },
                },
              },
            },
          },
          {
            // url: process.env.X402_FACILITATOR_URL || "https://x402.polygon.technology",
            url: process.env.X402_FACILITATOR_URL || "https://facilitator.x402.rs/",
          }
        );

        console.log("Dynamic X402 middleware created, applying to request...");

        // Apply the dynamic X402 middleware
        return dynamicX402Middleware(req, res, next);
      } else {
        // For all other routes, just pass through
        return next();
      }
    } catch (error: any) {
      console.error("Error in dynamic X402 middleware:", error);
      // If there's an error in the middleware, let the request proceed
      return next();
    }
  };
}
