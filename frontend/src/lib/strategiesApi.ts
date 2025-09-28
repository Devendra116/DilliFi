import { apiFetch } from "./http";

export type ChainAddress = { chainId: string; address: string };

export type StrategyTrigger = {
  type: string;
  condition: string;
  source_value?: number;
  target_value?: number;
  asset?: ChainAddress;
  source?: string;
};

export type IntegrationStep = {
  step_type: string;
  token?: ChainAddress;
  amount?: string;
  spender?: ChainAddress;
  version?: string;
  function_name?: string;
  token_in?: ChainAddress;
  token_out?: ChainAddress;
  amount_in?: string;
  amount_out_min?: string;
  path?: ChainAddress[];
  recipient?: ChainAddress;
  deadline?: string;
  extra?: Record<string, string>;
};

export type ExecutionStep = {
  integration_type: string;
  integration_steps: IntegrationStep[];
};

export type StrategyPayload = {
  name: string;
  desc: string;
  creator: ChainAddress;
  triggers: StrategyTrigger[];
  execution_steps: ExecutionStep[];
  pre_conditions: any[];
  max_supply: { chainId: string; address: string; amount: number };
  fee: { chainId: string; address: string; amount: number; recipient: string };
  payment_mode: string; // e.g. "x402"
};

export type CreateStrategyRequest = {
  userAddress: string;
  strategy: StrategyPayload;
};

export type BuyStrategyRequest = {
  buyerAddress: string;
  strategyId: string;
};

export type StrategySummary = {
  id?: string;
  name: string;
  desc: string;
  creator: ChainAddress;
  price?: string;
  rating?: number;
  users?: number;
};

export async function listStrategies() {
  const res: any = await apiFetch("/api/strategies", { method: "GET" });
  const arr = res?.data?.strategies ?? res?.strategies ?? res ?? [];
  return Array.isArray(arr) ? arr : [];
}

export async function createStrategy(req: CreateStrategyRequest) {
  return apiFetch("/api/strategies", { method: "POST", json: req });
}

export async function buyStrategy(req: BuyStrategyRequest) {
  return apiFetch("/api/strategies/buy", { method: "POST", json: req });
}

export async function getUserPurchases(userAddress: string) {
  return apiFetch(`/api/users/${userAddress}/purchases`, { method: "GET" });
}
