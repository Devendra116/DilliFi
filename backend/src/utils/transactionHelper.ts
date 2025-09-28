import { Hash, TransactionReceipt } from 'viem';
import { walletClient, publicClient } from '../config/web3';

export interface ExecutionResult {
  success: boolean;
  transactionHash?: Hash;
  receipt?: TransactionReceipt;
  error?: string;
  gasUsed?: bigint;
}

export interface ExecutionStep {
  stepType: string;
  stepIndex: number;
  result: ExecutionResult;
  timestamp: string;
}

/**
 * Wait for transaction confirmation and return result
 */
export async function waitForTransaction(hash: Hash): Promise<ExecutionResult> {
  try {
    console.log(`⏳ Waiting for transaction confirmation: ${hash}`);

    if (!publicClient) {
      throw new Error('Public client not initialized');
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000, // 60 second timeout
    });

    if (receipt.status === 'success') {
      console.log(`✅ Transaction confirmed: ${hash} (Gas used: ${receipt.gasUsed})`);
      return {
        success: true,
        transactionHash: hash,
        receipt,
        gasUsed: receipt.gasUsed,
      };
    } else {
      console.log(`❌ Transaction reverted: ${hash}`);
      return {
        success: false,
        transactionHash: hash,
        receipt,
        error: 'Transaction reverted',
      };
    }
  } catch (error: any) {
    console.error(`❌ Transaction failed: ${hash}`, error);
    return {
      success: false,
      transactionHash: hash,
      error: error.message || 'Transaction failed',
    };
  }
}

/**
 * Send transaction and wait for confirmation
 */
export async function sendTransactionAndWait(
  to: `0x${string}`,
  data: `0x${string}`,
  value: bigint = 0n
): Promise<ExecutionResult> {
  try {
    if (!walletClient) {
      throw new Error('Wallet client not initialized - check PRIVATE_KEY environment variable');
    }

    console.log(`📤 Sending transaction to: ${to}`);

    const hash = await walletClient.sendTransaction({
      to,
      data,
      value,
    });

    return await waitForTransaction(hash);
  } catch (error: any) {
    console.error('❌ Failed to send transaction:', error);
    return {
      success: false,
      error: error.message || 'Failed to send transaction',
    };
  }
}

/**
 * Get current timestamp for logging
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate deadline (current time + minutes)
 */
export function getDeadline(minutesFromNow: number = 20): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + (minutesFromNow * 60));
}

/**
 * Log execution step result
 */
export function logExecutionStep(step: ExecutionStep): void {
  const { stepType, stepIndex, result, timestamp } = step;

  console.log(`\n=== Execution Step ${stepIndex + 1}: ${stepType} ===`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Success: ${result.success}`);

  if (result.success) {
    console.log(`Transaction Hash: ${result.transactionHash}`);
    console.log(`Gas Used: ${result.gasUsed}`);
  } else {
    console.log(`Error: ${result.error}`);
  }
  console.log('================================================\n');
}

/**
 * Create execution step object
 */
export function createExecutionStep(
  stepType: string,
  stepIndex: number,
  result: ExecutionResult
): ExecutionStep {
  return {
    stepType,
    stepIndex,
    result,
    timestamp: getCurrentTimestamp(),
  };
}

/**
 * Parse address from schema format to string
 */
export function parseAddress(addressSchema: { chainId: string; address: string }): `0x${string}` {
  return addressSchema.address as `0x${string}`;
}

/**
 * Convert string amount to bigint
 */
export function parseAmount(amount: string): bigint {
  return BigInt(amount);
}