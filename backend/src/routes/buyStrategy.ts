import { Request, Response } from "express";
import mongoose from "mongoose";
import { Strategy } from "../models/Strategy";
import { StrategyPurchase } from "../models/StrategyPurchase";
import { fetchStrategyFeeData } from "../middleware/x402Config";
import { addTrigger, TimeTrigger } from "../utils/triggerManager";
import { exact } from "x402/schemes";
import {
  Network,
  PaymentPayload,
  PaymentRequirements,
  Price,
  Resource,
  settleResponseHeader,
} from "x402/types";
import { useFacilitator } from "x402/verify";
import { processPriceToAtomicAmount, findMatchingPaymentRequirements } from "x402/shared";

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const x402Version = 1;

if (!facilitatorUrl) {
  console.error("Missing FACILITATOR_URL environment variable");
}

const { verify, settle } = useFacilitator({ url: facilitatorUrl || "https://x402.polygon.technology" });

/**
 * Creates payment requirements for a given price and network
 */
function createExactPaymentRequirements(
  price: Price,
  network: Network,
  resource: Resource,
  payTo: `0x${string}`,
  description = "",
): PaymentRequirements {
  const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
  if ("error" in atomicAmountForAsset) {
    throw new Error(atomicAmountForAsset.error);
  }
  const { maxAmountRequired, asset } = atomicAmountForAsset;

  return {
    scheme: "exact",
    network,
    maxAmountRequired,
    resource,
    description,
    mimeType: "",
    payTo: payTo,
    maxTimeoutSeconds: 60,
    asset: asset.address,
    outputSchema: undefined,
    extra: {
      name: 'eip712' in asset ? asset.eip712.name : 'Unknown',
      version: 'eip712' in asset ? asset.eip712.version : '1',
    },
  };
}

/**
 * Verifies a payment and handles the response
 */
async function verifyPayment(
  req: Request,
  res: Response,
  paymentRequirements: PaymentRequirements[],
): Promise<boolean> {
  const payment = req.header("X-PAYMENT");
  if (!payment) {
    res.status(402).json({
      x402Version,
      error: "X-PAYMENT header is required",
      accepts: paymentRequirements,
    });
    return false;
  }

  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = exact.evm.decodePayment(payment);
    decodedPayment.x402Version = x402Version;
  } catch (error) {
    res.status(402).json({
      x402Version,
      error: error || "Invalid or malformed payment header",
      accepts: paymentRequirements,
    });
    return false;
  }

  try {
    const selectedPaymentRequirement =
      findMatchingPaymentRequirements(paymentRequirements, decodedPayment) ||
      paymentRequirements[0];
    const response = await verify(decodedPayment, selectedPaymentRequirement);
    if (!response.isValid) {
      res.status(402).json({
        x402Version,
        error: response.invalidReason,
        accepts: paymentRequirements,
        payer: response.payer,
      });
      return false;
    }
  } catch (error) {
    res.status(402).json({
      x402Version,
      error,
      accepts: paymentRequirements,
    });
    return false;
  }

  return true;
}

export const buyStrategy = async (req: Request, res: Response) => {
  try {
    console.log("=== buyStrategy handler called ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const { strategyId, buyerAddress } = req.body;

    // Validate strategyId format
    if (!mongoose.Types.ObjectId.isValid(strategyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid strategy ID format",
      });
    }

    // Fetch strategy fee data using function call
    let strategyFeeData;
    try {
      strategyFeeData = await fetchStrategyFeeData(strategyId);
    } catch (error: any) {
      if (error.message === "Strategy not found") {
        return res.status(404).json({
          success: false,
          error: "Strategy not found",
        });
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch strategy fee information",
      });
    }

    console.log("Strategy fee data:", strategyFeeData);

    // Create payment requirements using strategy data
    const resource = `${req.protocol}://${req.headers.host}${req.originalUrl}` as Resource;
    const paymentRequirements = [
      createExactPaymentRequirements(
        strategyFeeData.amount, // Use exact amount from database
        'polygon-amoy', // Fixed network
        resource,
        strategyFeeData.recipient as `0x${string}`, // Strategy-specific recipient
        `Purchase DeFi Strategy (${strategyId})`
      ),
    ];

    console.log("Payment requirements:", paymentRequirements);

    // Verify payment using X402 core functions
    const isValid = await verifyPayment(req, res, paymentRequirements);
    if (!isValid) {
      console.log("Payment verification failed, 402 response sent");
      return; // verifyPayment already sent the 402 response
    }

    console.log("Payment verification successful, processing purchase...");

    // Process payment settlement
    try {
      const decodedPayment = exact.evm.decodePayment(req.header("X-PAYMENT")!);

      // Find the matching payment requirement
      const selectedPaymentRequirement =
        findMatchingPaymentRequirements(paymentRequirements, decodedPayment) ||
        paymentRequirements[0];

      const settleResponse = await settle(decodedPayment, selectedPaymentRequirement);
      const responseHeader = settleResponseHeader(settleResponse);
      res.setHeader("X-PAYMENT-RESPONSE", responseHeader);

      console.log("Payment settled successfully:", responseHeader);

      // Extract payment information
      const x402PaymentId = (decodedPayment as any).paymentId || `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transactionHash = (decodedPayment as any).transactionHash || req.body.transactionHash;

      // Check if user already owns this strategy
      const existingPurchase = await StrategyPurchase.findOne({
        buyerAddress,
        strategyId,
      });

      if (existingPurchase) {
        return res.status(409).json({
          success: false,
          error: "User already owns this strategy",
        });
      }

      // Create purchase record with payment details
      const newPurchase = new StrategyPurchase({
        buyerAddress,
        strategyId,
        paymentAmount: strategyFeeData.amount,
        paymentRecipient: strategyFeeData.recipient,
        paymentCurrency: strategyFeeData.currency,
        paymentStatus: "completed", // X402 verification ensures payment was successful
        x402PaymentId,
        transactionHash: transactionHash || undefined,
      });

      const savedPurchase = await newPurchase.save();

      // Register trigger for strategy execution after successful purchase
      try {
        // Fetch the full strategy to get trigger details
        const strategyDoc = await Strategy.findById(strategyId);
        if (strategyDoc && strategyDoc.strategy.triggers.length > 0) {
          const trigger = strategyDoc.strategy.triggers[0]; // Get first trigger

          if (trigger.type === "time") {
            // Create execution endpoint URL
            const executionUrl = `${req.protocol}://${req.headers.host}/api/strategies/execute`;

            // Create trigger for execution
            const timeTrigger: TimeTrigger = {
              id: `strategy_${savedPurchase._id}_${Date.now()}`,
              type: "time",
              cron_time: trigger.time,
              endpoint: executionUrl,
              strategy_id: strategyId.toString(),
              active: true,
            };

            addTrigger(timeTrigger);
            console.log(`✅ Trigger registered for strategy ${strategyId}: ${trigger.time}`);
          }
        }
      } catch (triggerError) {
        console.error("Failed to register trigger:", triggerError);
        // Don't fail the purchase if trigger registration fails
      }

      return res.status(201).json({
        success: true,
        data: {
          purchaseId: savedPurchase._id,
          strategyId: savedPurchase.strategyId,
          buyerAddress: savedPurchase.buyerAddress,
          paymentAmount: savedPurchase.paymentAmount,
          paymentCurrency: savedPurchase.paymentCurrency,
          paymentRecipient: savedPurchase.paymentRecipient,
          x402PaymentId: savedPurchase.x402PaymentId,
          transactionHash: savedPurchase.transactionHash,
          purchasedAt: savedPurchase.purchasedAt,
          message: "Strategy purchased successfully",
        },
      });

    } catch (error: any) {
      console.error("Payment settlement failed:", error);
      return res.status(402).json({
        x402Version,
        error: "Payment settlement failed",
        accepts: paymentRequirements,
      });
    }
  } catch (error: any) {
    // Handle duplicate errors
    if (error.code === 11000) {
      if (error.keyPattern?.x402PaymentId) {
        return res.status(409).json({
          success: false,
          error: "X402 payment ID already used",
        });
      }
      if (error.keyPattern?.transactionHash) {
        return res.status(409).json({
          success: false,
          error: "Transaction hash already used",
        });
      }
      return res.status(409).json({
        success: false,
        error: "Duplicate purchase detected",
      });
    }

    console.error("Error purchasing strategy:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
