import mongoose from 'mongoose';
import { Strategy } from '../models/Strategy';

export interface StrategyFeeData {
  amount: number;
  recipient: string;
  chainId: string;
  tokenAddress: string;
  currency: string;
}

export async function getStrategyFeeConfig(strategyId: string): Promise<StrategyFeeData | null> {
  try {
    // Validate strategyId format
    if (!mongoose.Types.ObjectId.isValid(strategyId)) {
      throw new Error('Invalid strategy ID format');
    }

    // Fetch strategy from MongoDB
    const strategy = await Strategy.findById(strategyId);
    if (!strategy) {
      return null;
    }

    // Extract fee information from strategy
    const { fee } = strategy.strategy;
    if (!fee) {
      throw new Error('Strategy does not have fee information');
    }

    // Map token address to currency name (simplified mapping)
    const getCurrencyFromAddress = (address: string): string => {
      const lowerAddress = address.toLowerCase();
      // Common token addresses (mainnet)
      if (lowerAddress === '0xa0b86a33e644c53c5d7f2bd7f6d2b7a1e23d2b1e') return 'USDC';
      if (lowerAddress === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') return 'WETH';
      // Default to token symbol or address
      return 'TOKEN';
    };

    return {
      amount: fee.amount,
      recipient: fee.recipient,
      chainId: fee.chainId,
      tokenAddress: fee.address,
      currency: getCurrencyFromAddress(fee.address)
    };

  } catch (error) {
    console.error('Error fetching strategy fee config:', error);
    throw error;
  }
}

export function formatX402Price(amount: number, currency: string = 'USDC'): string {
  // Format price for x402 middleware (e.g., "$0.1" for USDC)
  return `$${amount}`;
}