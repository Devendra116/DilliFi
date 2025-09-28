import { createPublicClient, http, type Address } from "viem";
import { celo, celoAlfajores } from "viem/chains";

// Minimal ABI for the functions we need
export const SELF_VERIFIER_ABI = [
  {
    inputs: [{ internalType: "address", name: "human", type: "address" }],
    name: "isHuman",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "human", type: "address" }],
    name: "getVerificationDetails",
    outputs: [
      { internalType: "bool", name: "verified", type: "bool" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bytes32", name: "id", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_SELF_CONTRACT_ADDRESS || ""
).trim() as Address;

function getRpcAndChain() {
  const net = (process.env.NEXT_PUBLIC_SELF_NETWORK || "celo").toLowerCase();
  if (
    net === "staging_celo" ||
    net === "alfajores" ||
    net === "celo-alfajores"
  ) {
    return {
      chain: celoAlfajores,
      rpcUrl: "https://alfajores-forno.celo-testnet.org",
    } as const;
  }
  // default to main Celo
  return {
    chain: celo,
    rpcUrl: "https://forno.celo.org",
  } as const;
}

const { chain, rpcUrl } = getRpcAndChain();

const client = createPublicClient({ chain, transport: http(rpcUrl) });

export async function isHumanOnChain(
  address?: string | null
): Promise<boolean> {
  try {
    if (!CONTRACT_ADDRESS || !address) return false;
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: SELF_VERIFIER_ABI,
      functionName: "isHuman",
      args: [address as Address],
    });
    console.log("isHumanOnChain result:", result);
    return Boolean(result);
  } catch {
    return false;
  }
}

export async function getVerificationDetails(address?: string | null) {
  try {
    if (!CONTRACT_ADDRESS || !address) return null;
    const [verified, timestamp, id] = (await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: SELF_VERIFIER_ABI,
      functionName: "getVerificationDetails",
      args: [address as Address],
    })) as unknown as [boolean, bigint, `0x${string}`];
    return { verified, timestamp: Number(timestamp), id };
  } catch {
    return null;
  }
}
