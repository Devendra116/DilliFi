import { z } from "zod";

// Helper: Address schema - shared across all schema files
export const AddressSchema = z.object({
  chainId: z.string(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export type Address = z.infer<typeof AddressSchema>;