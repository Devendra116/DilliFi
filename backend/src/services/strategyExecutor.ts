import { Strategy } from '../models/Strategy';
import { UniswapStep } from '../utils/schemas/uniswap';
import { executeApproval } from '../executors/approvalExecutor';
import { executeSwap } from '../executors/swapExecutor';
import { executeAddLiquidity, executeRemoveLiquidity } from '../executors/liquidityExecutor';
import {
  ExecutionResult,
  ExecutionStep,
  createExecutionStep,
  logExecutionStep,
  getCurrentTimestamp
} from '../utils/transactionHelper';

export interface StrategyExecutionResult {
  success: boolean;
  strategyId: string;
  executionSteps: ExecutionStep[];
  startTime: string;
  endTime: string;
  totalGasUsed: bigint;
  error?: string;
}

/**
 * Main strategy execution orchestrator
 */
export async function executeStrategy(strategyId: string): Promise<StrategyExecutionResult> {
  const startTime = getCurrentTimestamp();
  const executionSteps: ExecutionStep[] = [];
  let totalGasUsed = 0n;

  try {
    console.log(`🚀 Starting strategy execution: ${strategyId}`);

    // Fetch strategy from database
    const strategyDoc = await Strategy.findById(strategyId);
    if (!strategyDoc) {
      throw new Error(`Strategy not found: ${strategyId}`);
    }

    const strategy = strategyDoc.strategy;
    console.log(`📋 Strategy: ${strategy.name} by ${strategy.creator.address}`);
    console.log(`📊 Execution steps: ${strategy.execution_steps.length}`);

    // Execute each integration step
    for (let i = 0; i < strategy.execution_steps.length; i++) {
      const executionStep = strategy.execution_steps[i];
      console.log(`\n🔧 Processing integration ${i + 1}: ${executionStep.integration_type}`);

      if (executionStep.integration_type !== 'uniswap') {
        const error = `Unsupported integration type: ${executionStep.integration_type}`;
        console.error(`❌ ${error}`);

        const failedStep = createExecutionStep(
          executionStep.integration_type,
          i,
          { success: false, error }
        );
        executionSteps.push(failedStep);
        logExecutionStep(failedStep);
        continue;
      }

      // Execute each sub-step within the integration
      for (let j = 0; j < executionStep.integration_steps.length; j++) {
        const step = executionStep.integration_steps[j] as UniswapStep;
        const stepIndex = i * 100 + j; // Unique step index

        console.log(`\n  🎯 Executing step ${j + 1}/${executionStep.integration_steps.length}: ${step.step_type}`);

        let result: ExecutionResult;

        try {
          // Route to appropriate executor based on step type
          switch (step.step_type) {
            case 'approval':
              result = await executeApproval(step);
              break;

            case 'swap':
              result = await executeSwap(step);
              break;

            case 'add_liquidity':
              result = await executeAddLiquidity(step);
              break;

            case 'remove_liquidity':
              result = await executeRemoveLiquidity(step);
              break;

            default:
              result = {
                success: false,
                error: `Unsupported step type: ${(step as any).step_type}`,
              };
          }

          // Track gas usage
          if (result.gasUsed) {
            totalGasUsed += result.gasUsed;
          }

        } catch (stepError: any) {
          console.error(`❌ Step execution error:`, stepError);
          result = {
            success: false,
            error: stepError.message || 'Step execution failed',
          };
        }

        // Create and log execution step
        const executionStepRecord = createExecutionStep(step.step_type, stepIndex, result);
        executionSteps.push(executionStepRecord);
        logExecutionStep(executionStepRecord);

        // Stop execution if step failed (fail-fast approach)
        if (!result.success) {
          console.error(`❌ Step failed, stopping strategy execution: ${result.error}`);
          return {
            success: false,
            strategyId,
            executionSteps,
            startTime,
            endTime: getCurrentTimestamp(),
            totalGasUsed,
            error: `Strategy execution failed at step ${stepIndex}: ${result.error}`,
          };
        }

        console.log(`✅ Step ${j + 1} completed successfully`);
      }

      console.log(`✅ Integration ${i + 1} completed successfully`);
    }

    const endTime = getCurrentTimestamp();
    console.log(`\n🎉 Strategy execution completed successfully!`);
    console.log(`⏱️  Total execution time: ${startTime} - ${endTime}`);
    console.log(`⛽ Total gas used: ${totalGasUsed}`);
    console.log(`🔢 Total steps executed: ${executionSteps.length}`);

    return {
      success: true,
      strategyId,
      executionSteps,
      startTime,
      endTime,
      totalGasUsed,
    };

  } catch (error: any) {
    const endTime = getCurrentTimestamp();
    console.error(`❌ Strategy execution failed:`, error);

    return {
      success: false,
      strategyId,
      executionSteps,
      startTime,
      endTime,
      totalGasUsed,
      error: error.message || 'Strategy execution failed',
    };
  }
}

/**
 * Validate strategy before execution
 */
export async function validateStrategy(strategyId: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const strategyDoc = await Strategy.findById(strategyId);
    if (!strategyDoc) {
      return { valid: false, error: 'Strategy not found' };
    }

    const strategy = strategyDoc.strategy;

    // Check if strategy has execution steps
    if (!strategy.execution_steps || strategy.execution_steps.length === 0) {
      return { valid: false, error: 'Strategy has no execution steps' };
    }

    // Validate each execution step
    for (const executionStep of strategy.execution_steps) {
      if (executionStep.integration_type !== 'uniswap') {
        return {
          valid: false,
          error: `Unsupported integration type: ${executionStep.integration_type}`
        };
      }

      if (!executionStep.integration_steps || executionStep.integration_steps.length === 0) {
        return { valid: false, error: 'Integration step has no sub-steps' };
      }

      // Validate step types
      for (const step of executionStep.integration_steps) {
        const supportedTypes = ['approval', 'swap', 'add_liquidity', 'remove_liquidity'];
        if (!supportedTypes.includes(step.step_type)) {
          return {
            valid: false,
            error: `Unsupported step type: ${step.step_type}`
          };
        }
      }
    }

    return { valid: true };

  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Strategy validation failed'
    };
  }
}