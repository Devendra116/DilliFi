import { encodeFunctionData } from 'viem';
import { AddLiquidityStep, RemoveLiquidityStep } from '../utils/schemas/uniswap';
import {
  UNISWAP_V2_ROUTER_ABI,
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
 * Execute add liquidity operation
 */
export async function executeAddLiquidity(step: AddLiquidityStep): Promise<ExecutionResult> {
  try {
    console.log(`➕ Executing add liquidity step:`, {
      version: step.version,
      tokenA: step.token_a.address,
      tokenB: step.token_b.address,
      amountA: step.amount_a,
      amountB: step.amount_b,
      recipient: step.recipient.address,
    });

    if (!walletClient) {
      throw new Error('Wallet client not initialized - check PRIVATE_KEY environment variable');
    }

    const tokenAAddress = parseAddress(step.token_a);
    const tokenBAddress = parseAddress(step.token_b);
    const amountADesired = parseAmount(step.amount_a);
    const amountBDesired = parseAmount(step.amount_b);
    const recipientAddress = parseAddress(step.recipient);

    // Calculate minimum amounts (with 1% slippage tolerance if not provided)
    const amountAMin = step.min_amount_a
      ? BigInt(Math.floor(step.min_amount_a))
      : (amountADesired * 99n) / 100n;
    const amountBMin = step.min_amount_b
      ? BigInt(Math.floor(step.min_amount_b))
      : (amountBDesired * 99n) / 100n;

    const deadline = getDeadline(20); // 20 minutes from now

    if (step.version === 'v2') {
      const routerAddress = CONTRACTS.UNISWAP_V3_ROUTER as `0x${string}`; // Using V3 router for now

      // Encode add liquidity function
      const data = encodeFunctionData({
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'addLiquidity',
        args: [
          tokenAAddress,
          tokenBAddress,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          recipientAddress,
          deadline,
        ],
      });

      console.log(`📤 Sending add liquidity transaction to router: ${routerAddress}`);

      // Send add liquidity transaction
      const hash = await walletClient.sendTransaction({
        to: routerAddress,
        data,
      });

      // Wait for confirmation
      const result = await waitForTransaction(hash);

      if (result.success) {
        console.log(`✅ Add liquidity successful: ${step.token_a.address} + ${step.token_b.address}`);
      } else {
        console.log(`❌ Add liquidity failed: ${result.error}`);
      }

      return result;
    } else {
      throw new Error(`Unsupported Uniswap version for add liquidity: ${step.version}`);
    }

  } catch (error: any) {
    console.error('❌ Add liquidity execution failed:', error);
    return {
      success: false,
      error: error.message || 'Add liquidity execution failed',
    };
  }
}

/**
 * Execute remove liquidity operation
 */
export async function executeRemoveLiquidity(step: RemoveLiquidityStep): Promise<ExecutionResult> {
  try {
    console.log(`➖ Executing remove liquidity step:`, {
      version: step.version,
      lpToken: step.lp_token.address,
      amount: step.amount,
      recipient: step.recipient.address,
    });

    if (!walletClient) {
      throw new Error('Wallet client not initialized - check PRIVATE_KEY environment variable');
    }

    // Note: This is a simplified implementation
    // In reality, we'd need to determine tokenA and tokenB from the LP token
    // For now, we'll throw an error indicating this needs more implementation
    throw new Error('Remove liquidity requires additional implementation to determine token pair from LP token');

    // Future implementation would look like:
    /*
    const lpTokenAddress = parseAddress(step.lp_token);
    const liquidity = BigInt(Math.floor(step.amount));
    const recipientAddress = parseAddress(step.recipient);

    // Would need to query the LP token contract to get underlying tokens
    // const [tokenA, tokenB] = await getLPTokenPair(lpTokenAddress);

    const amountAMin = step.min_amount_a
      ? BigInt(Math.floor(step.min_amount_a))
      : 0n;
    const amountBMin = step.min_amount_b
      ? BigInt(Math.floor(step.min_amount_b))
      : 0n;

    const deadline = getDeadline(20);

    if (step.version === 'v2') {
      const routerAddress = CONTRACTS.UNISWAP_V3_ROUTER as `0x${string}`;

      const data = encodeFunctionData({
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'removeLiquidity',
        args: [
          tokenA,
          tokenB,
          liquidity,
          amountAMin,
          amountBMin,
          recipientAddress,
          deadline,
        ],
      });

      const hash = await walletClient.sendTransaction({
        to: routerAddress,
        data,
      });

      return await waitForTransaction(hash);
    }
    */

  } catch (error: any) {
    console.error('❌ Remove liquidity execution failed:', error);
    return {
      success: false,
      error: error.message || 'Remove liquidity execution failed',
    };
  }
}

/**
 * Calculate optimal amounts for liquidity provision
 */
export function calculateOptimalAmounts(
  amountADesired: bigint,
  amountBDesired: bigint,
  reserveA: bigint,
  reserveB: bigint
): { amountA: bigint; amountB: bigint } {
  if (reserveA === 0n && reserveB === 0n) {
    // First liquidity provision
    return { amountA: amountADesired, amountB: amountBDesired };
  }

  // Calculate optimal amounts based on current reserves
  const amountBOptimal = (amountADesired * reserveB) / reserveA;

  if (amountBOptimal <= amountBDesired) {
    return { amountA: amountADesired, amountB: amountBOptimal };
  } else {
    const amountAOptimal = (amountBDesired * reserveA) / reserveB;
    return { amountA: amountAOptimal, amountB: amountBDesired };
  }
}