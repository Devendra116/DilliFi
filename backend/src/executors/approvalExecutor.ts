import { encodeFunctionData, erc20Abi } from "viem";
import { ApprovalStep } from "../utils/schemas/uniswap";
import { ERC20_ABI, walletClient, publicClient } from "../config/web3";
import {
  ExecutionResult,
  waitForTransaction,
  parseAddress,
  parseAmount,
} from "../utils/transactionHelper";

/**
 * Execute ERC20 token approval
 */
export async function executeApproval(
  step: ApprovalStep
): Promise<ExecutionResult> {
  try {
    console.log(`🔓 Executing approval step:`, {
      token: step.token.address,
      spender: step.spender.address,
      amount: step.amount,
    });

    if (!walletClient) {
      throw new Error(
        "Wallet client not initialized - check PRIVATE_KEY environment variable"
      );
    }

    if (!publicClient) {
      throw new Error("Public client not initialized");
    }

    const tokenAddress = parseAddress(step.token);
    const spenderAddress = parseAddress(step.spender);
    const amount = parseAmount(step.amount);


    // Check current allowance
    console.log(`📖 Checking current allowance...`);
    const currentAllowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [walletClient.account.address, spenderAddress],
    });

    console.log(`Current allowance: ${currentAllowance}, Required: ${amount}`);

    // If allowance is sufficient, skip approval
    if (currentAllowance >= amount) {
      console.log(`✅ Sufficient allowance already exists, skipping approval`);
      return {
        success: true,
        transactionHash: undefined,
        error: undefined,
      };
    }

    // Check token balance
    console.log(`💰 Checking token balance...`);
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [walletClient.account.address],
    });

    console.log(`Token balance: ${balance}, Required: ${amount}`);

    if (balance < amount) {
      throw new Error(
        `Insufficient token balance. Have: ${balance}, Need: ${amount}`
      );
    }

    // Encode approval function call
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, amount],
    });

    // Send approval transaction
    console.log(`📤 Sending approval transaction...`);
    const hash = await walletClient.sendTransaction({
      to: tokenAddress,
      data,
    });

    // Wait for confirmation
    const result = await waitForTransaction(hash);

    if (result.success) {
      console.log(
        `✅ Approval successful: ${step.token.address} → ${step.spender.address}`
      );
    } else {
      console.log(`❌ Approval failed: ${result.error}`);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Approval execution failed:", error);
    return {
      success: false,
      error: error.message || "Approval execution failed",
    };
  }
}

/**
 * Check if approval is needed
 */
export async function checkApprovalNeeded(
  tokenAddress: `0x${string}`,
  spenderAddress: `0x${string}`,
  amount: bigint,
  ownerAddress: `0x${string}`
): Promise<boolean> {
  try {
    if (!publicClient) {
      throw new Error("Public client not initialized");
    }

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [ownerAddress, spenderAddress],
    });

    return allowance < amount;
  } catch (error) {
    console.error("Error checking approval:", error);
    return true; // Assume approval is needed if check fails
  }
}
