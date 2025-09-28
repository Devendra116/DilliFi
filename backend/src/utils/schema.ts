import { z } from "zod";
import { UniswapStepSchema } from "./schemas/uniswap";
import { AddressSchema } from "./schemas/common";

// Trigger schemas
const TimeTrigger = z.object({
  type: z.literal("time"),
  time: z.string(), // cron string required
});

const PriceTrigger = z.object({
  type: z.literal("price"),
  condition: z.enum(["above", "below", "equal", "range"]),
  source_value: z.number(),
  target_value: z.number(),
  asset: AddressSchema.optional(),
  source: z.string().url(),
});

// Discriminated union for triggers
export const TriggerSchema = z.discriminatedUnion("type", [TimeTrigger, PriceTrigger]);

export const ExecutionStepSchema = z.object({
  integration_type: z.literal("uniswap"), // Future: z.enum(["uniswap", "aave", "compound"])
  integration_steps: z.array(UniswapStepSchema).min(1),
});

// Main Strategy schema
export const StrategySchema = z.object({
  name: z.string(),
  desc: z.string(),
  creator: AddressSchema,
  triggers: z.array(TriggerSchema).max(1, "Only one trigger allowed"),
  execution_steps: z.array(ExecutionStepSchema).min(1),
  pre_conditions: z.array(z.any()), // define condition schema if needed
  max_supply: AddressSchema.extend({ amount: z.number().nonnegative() }),
  fee: AddressSchema.extend({
    amount: z.number().nonnegative(),
    recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  }),
  payment_mode: z.enum(["x402"]),
});

// Re-export AddressSchema for convenience
export { AddressSchema } from "./schemas/common";

// TypeScript types
export type { Address } from "./schemas/common";
export type Trigger = z.infer<typeof TriggerSchema>;
export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;
export type Strategy = z.infer<typeof StrategySchema>;