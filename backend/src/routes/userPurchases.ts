import { Request, Response } from "express";
import { StrategyPurchase } from "../models/StrategyPurchase";

export const getUserPurchases = async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.params;

    // Validate userAddress
    if (!userAddress || typeof userAddress !== "string") {
      return res.status(400).json({
        success: false,
        error: "userAddress is required and must be a string",
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userAddress format. Must be a valid Ethereum address (0x...)",
      });
    }

    console.log("Fetching purchases for user:", userAddress);

    // Find all purchases by this user and populate strategy details
    const purchases = await StrategyPurchase.find({ buyerAddress: userAddress })
      .populate('strategyId', 'strategy userAddress strategyHash createdAt updatedAt')
      .sort({ purchasedAt: -1 }) // Most recent first
      .lean();

    console.log(`Found ${purchases.length} purchases for user ${userAddress}`);

    // Format the response to include strategy data
    const formattedPurchases = purchases.map(purchase => {
      const strategy = purchase.strategyId as any; // Type assertion for populated document
      return {
        strategyId: strategy._id,
        strategy: strategy.strategy,
        strategyCreator: strategy.userAddress,
        strategyHash: strategy.strategyHash,
        purchasedAt: purchase.purchasedAt,
        paymentAmount: purchase.paymentAmount,
        paymentCurrency: purchase.paymentCurrency,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedPurchases,
    });

  } catch (error: any) {
    console.error("Error fetching user purchases:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};