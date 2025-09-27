import { z } from "zod";
import { AddressSchema } from "./common";

// Approval step
export const ApprovalStepSchema = z.object({
  step_type: z.literal("approval"),
  token: AddressSchema,
  amount: z.string().regex(/^\d+$/), // big number as string
  spender: AddressSchema,
});

// Swap step
export const SwapStepSchema = z.object({
  step_type: z.literal("swap"),
  version: z.enum(["v1", "v2", "v3", "v4"]),
  function_name: z.string(), // e.g., swapExactTokensForTokens
  token_in: AddressSchema,
  token_out: AddressSchema,
  amount_in: z.string().regex(/^\d+$/), // big number as string
  amount_out_min: z.string().regex(/^\d+$/),
  path: z.array(AddressSchema).optional(), // for multi-hop
  recipient: AddressSchema,
  deadline: z.string().optional(),
  extra: z.record(z.string(), z.any()).optional(),
});

// Add Liquidity step
export const AddLiquidityStepSchema = z.object({
  step_type: z.literal("add_liquidity"),
  version: z.enum(["v1", "v2", "v3", "v4"]),
  token_a: AddressSchema,
  token_b: AddressSchema,
  amount_a: z.string().regex(/^\d+$/), // big number as string
  amount_b: z.string().regex(/^\d+$/), // big number as string
  min_amount_a: z.number().nonnegative().optional(),
  min_amount_b: z.number().nonnegative().optional(),
  pool_address: AddressSchema, // If known
  recipient: AddressSchema,
  extra: z.record(z.string(), z.any()).optional(),
});

// Remove Liquidity step
export const RemoveLiquidityStepSchema = z.object({
  step_type: z.literal("remove_liquidity"),
  version: z.enum(["v1", "v2", "v3", "v4"]),
  lp_token: AddressSchema,
  amount: z.number().nonnegative(),
  min_amount_a: z.number().nonnegative().optional(),
  min_amount_b: z.number().nonnegative().optional(),
  recipient: AddressSchema,
  extra: z.record(z.string(), z.any()).optional(),
});

// Generic contract call step
export const GenericStepSchema = z.object({
  step_type: z.literal("contract_call"),
  contract_address: AddressSchema,
  function_name: z.string(),
  parameters: z.record(z.string(), z.any()), // dynamic params
});

// Uniswap execution step (union of all step types)
export const UniswapStepSchema = z.discriminatedUnion("step_type", [
  ApprovalStepSchema,
  SwapStepSchema,
  AddLiquidityStepSchema,
  RemoveLiquidityStepSchema,
  GenericStepSchema,
]);

// TypeScript types
export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;
export type SwapStep = z.infer<typeof SwapStepSchema>;
export type AddLiquidityStep = z.infer<typeof AddLiquidityStepSchema>;
export type RemoveLiquidityStep = z.infer<typeof RemoveLiquidityStepSchema>;
export type GenericStep = z.infer<typeof GenericStepSchema>;
export type UniswapStep = z.infer<typeof UniswapStepSchema>;
