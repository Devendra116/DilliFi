import { Request, Response } from "express";
import { StrategySchema } from "../utils/schema";
import { Strategy } from "../models/Strategy";
import { generateStrategyHash } from "../utils/strategyHash";

export const createStrategy = async (req: Request, res: Response) => {
  try {
    const { userAddress, strategy } = req.body;

    // Validate userAddress
    if (!userAddress || typeof userAddress !== "string") {
      return res.status(400).json({
        success: false,
        error: "userAddress is required and must be a string",
      });
    }

    // Validate strategy with Zod schema
    console.log(typeof strategy);
    try {
      const result = StrategySchema.parse(strategy);
      console.log(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        error: "Invalid strategy data",
        details: error,
      });
    }
    const validationResult = StrategySchema.safeParse(strategy);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid strategy data",
        details: validationResult.error.errors,
      });
    }

    const validatedStrategy = validationResult.data;

    // Generate hash from triggers and execution_steps
    const strategyHash = generateStrategyHash(
      validatedStrategy.triggers,
      validatedStrategy.execution_steps
    );

    // Try to save to database
    const newStrategy = new Strategy({
      userAddress,
      strategyHash,
      strategy: validatedStrategy,
    });

    const savedStrategy = await newStrategy.save();

    return res.status(201).json({
      success: true,
      data: {
        strategyId: savedStrategy._id,
        strategyHash: savedStrategy.strategyHash,
        message: "Strategy created successfully",
      },
    });
  } catch (error: any) {
    // Handle duplicate strategy error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Strategy already exists for this user",
      });
    }

    console.error("Error creating strategy:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getStrategies = async (req: Request, res: Response) => {
  try {
    const userAddress = req.query.userAddress as string;

    // Validate userAddress format if provided
    if (userAddress && !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid userAddress format. Must be a valid Ethereum address (0x...)",
      });
    }

    // Build query filter
    const filter = userAddress ? { userAddress } : {};

    // Query database with sorting (newest first)
    const strategies = await Strategy.find(filter)
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Prepare response
    const response: any = {
      success: true,
      data: {
        strategies,
        count: strategies.length,
      },
    };

    // Add userAddress to response if filtering
    if (userAddress) {
      response.data.userAddress = userAddress;
    }

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Error fetching strategies:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
