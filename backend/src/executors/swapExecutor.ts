import { encodeFunctionData } from 'viem';
import { SwapStep } from '../utils/schemas/uniswap';
import {
  UNISWAP_V2_ROUTER_ABI,
  UNISWAP_V3_ROUTER_ABI,
  CONTRACTS,
  walletClient
} from '../config/web3';
import {
  ExecutionResult,
  waitForTransaction,
  parseAddress,
  parseAmount,
  getDeadline
} from '../utils/transactionHelper';

/**
 * Execute Uniswap token swap
 */
export async function executeSwap(step: SwapStep): Promise<ExecutionResult> {
  try {
    console.log(`🔄 Executing swap step:`, {
      version: step.version,
      tokenIn: step.token_in.address,
      tokenOut: step.token_out.address,
      amountIn: step.amount_in,
      amountOutMin: step.amount_out_min,
      recipient: step.recipient.address,
    });

    if (!walletClient) {
      throw new Error('Wallet client not initialized - check PRIVATE_KEY environment variable');
    }

    const tokenInAddress = parseAddress(step.token_in);
    const tokenOutAddress = parseAddress(step.token_out);
    const amountIn = parseAmount(step.amount_in);
    const amountOutMin = parseAmount(step.amount_out_min);
    const recipientAddress = parseAddress(step.recipient);
    const deadline = step.deadline ? parseAmount(step.deadline) : getDeadline(20);

    let data: `0x${string}`;
    let routerAddress: `0x${string}`;

    if (step.version === 'v2') {
      routerAddress = CONTRACTS.UNISWAP_V3_ROUTER as `0x${string}`; // Using V3 router for now

      // Build path array - default to direct swap if no path provided
      const path = step.path ? step.path.map(parseAddress) : [tokenInAddress, tokenOutAddress];

      // Encode V2 swap function
      data = encodeFunctionData({
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountIn, amountOutMin, path, recipientAddress, deadline],
      });
    } else if (step.version === 'v3') {
      routerAddress = CONTRACTS.UNISWAP_V3_ROUTER as `0x${string}`;

      // For V3, use exactInputSingle with default fee tier
      const fee = step.extra?.fee ? Number(step.extra.fee) : 3000; // 0.3% default fee

      const swapParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee,
        recipient: recipientAddress,
        deadline,
        amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0n, // No price limit
      };

      // Encode V3 swap function
      data = encodeFunctionData({
        abi: UNISWAP_V3_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [swapParams],
      });
    } else {
      throw new Error(`Unsupported Uniswap version: ${step.version}`);
    }

    console.log(`📤 Sending swap transaction to router: ${routerAddress}`);

    // Send swap transaction
    const hash = await walletClient.sendTransaction({
      to: routerAddress,
      data,
    });

    // Wait for confirmation
    const result = await waitForTransaction(hash);

    if (result.success) {
      console.log(`✅ Swap successful: ${step.token_in.address} → ${step.token_out.address}`);
    } else {
      console.log(`❌ Swap failed: ${result.error}`);
    }

    return result;

  } catch (error: any) {
    console.error('❌ Swap execution failed:', error);
    return {
      success: false,
      error: error.message || 'Swap execution failed',
    };
  }
}

/**
 * Calculate minimum output amount with slippage protection
 */
export function calculateMinimumOutput(
  expectedOutput: bigint,
  slippagePercentage: number = 1 // 1% default slippage
): bigint {
  const slippageFactor = BigInt(Math.floor((100 - slippagePercentage) * 100));
  return (expectedOutput * slippageFactor) / 10000n;
}

/**
 * Build swap path for multi-hop swaps
 */
export function buildSwapPath(
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  intermediateTokens: `0x${string}`[] = []
): `0x${string}`[] {
  if (intermediateTokens.length === 0) {
    return [tokenIn, tokenOut];
  }

  return [tokenIn, ...intermediateTokens, tokenOut];
}