import { Request, Response } from "express";
import mongoose from "mongoose";
import { executeStrategy as executeStrategyService, validateStrategy } from "../services/strategyExecutor";

export const executeStrategy = async (req: Request, res: Response) => {
  try {
    console.log("=== executeStrategy handler called ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const { triggerId, strategyId } = req.body;

    // Validate required fields
    // if (!triggerId) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "triggerId is required",
    //   });
    // }

    if (!strategyId) {
      return res.status(400).json({
        success: false,
        error: "strategyId is required",
      });
    }

    // Validate strategyId format
    if (!mongoose.Types.ObjectId.isValid(strategyId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid strategy ID format",
      });
    }

    console.log(`⚡ Starting strategy execution: ${strategyId} (triggered by ${triggerId})`);

    // Validate strategy before execution
    const validation = await validateStrategy(strategyId);
    if (!validation.valid) {
      console.error(`❌ Strategy validation failed: ${validation.error}`);
      return res.status(400).json({
        success: false,
        error: "Strategy validation failed",
        details: validation.error,
      });
    }

    console.log(`✅ Strategy validation passed, proceeding with execution...`);

    // Execute the strategy
    const executionResult = await executeStrategyService(strategyId);

    if (executionResult.success) {
      console.log(`🎉 Strategy execution completed successfully`);
      return res.status(200).json({
        success: true,
        data: {
          strategyId: executionResult.strategyId,
          triggerId,
          executedAt: executionResult.endTime,
          executionSteps: executionResult.executionSteps.length,
          totalGasUsed: executionResult.totalGasUsed.toString(),
          executionTime: `${executionResult.startTime} - ${executionResult.endTime}`,
          message: "Strategy executed successfully",
          stepDetails: executionResult.executionSteps.map(step => ({
            stepType: step.stepType,
            stepIndex: step.stepIndex,
            success: step.result.success,
            transactionHash: step.result.transactionHash,
            gasUsed: step.result.gasUsed?.toString(),
            error: step.result.error,
          })),
        },
      });
    } else {
      console.error(`❌ Strategy execution failed: ${executionResult.error}`);
      return res.status(500).json({
        success: false,
        error: "Strategy execution failed",
        details: executionResult.error,
        data: {
          strategyId: executionResult.strategyId,
          triggerId,
          executionSteps: executionResult.executionSteps.length,
          totalGasUsed: executionResult.totalGasUsed.toString(),
          executionTime: `${executionResult.startTime} - ${executionResult.endTime}`,
          stepDetails: executionResult.executionSteps.map(step => ({
            stepType: step.stepType,
            stepIndex: step.stepIndex,
            success: step.result.success,
            transactionHash: step.result.transactionHash,
            gasUsed: step.result.gasUsed?.toString(),
            error: step.result.error,
          })),
        },
      });
    }

  } catch (error: any) {
    console.error("❌ Strategy execution handler error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};