// Centralised Self integration config. Values prefer NEXT_PUBLIC_* envs
// to support deployments without code changes.
export const SELF_CONFIG = {
  // App identity
  appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "EthGlobal Delhi Demo",
  // Scope to bind your verification flow. Prefer env; fallback to current default.
  scope: process.env.NEXT_PUBLIC_SELF_SCOPE,
  // SDK endpoint configuration
  endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || "",
  endpointType: process.env.NEXT_PUBLIC_SELF_ENDPOINT_TYPE || "staging_celo",

  // Optional app branding for QR code (can be URL)
  logoUrl:
    process.env.NEXT_PUBLIC_SELF_LOGO_URL ||
    "https://i.postimg.cc/mrmVf9hm/self.png",

  // Network + contracts (useful for contract verification flows)
  network: process.env.NEXT_PUBLIC_SELF_NETWORK || "celoSepolia",
  verificationConfigId:
    process.env.NEXT_PUBLIC_SELF_VERIFICATION_CONFIG_ID ||
    "0xc52f992ebee4435b00b65d2c74b12435e96359d1ccf408041528414e6ea687bc",
  contractAddress:
    process.env.NEXT_PUBLIC_SELF_CONTRACT_ADDRESS ||
    "0x02B7A35959B9BFB1f4580Efac032DE63E9E780F1",
  identityVerificationHubV2Address:
    process.env.NEXT_PUBLIC_SELF_IVH_V2_ADDRESS ||
    "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74",
  // Toggle to show a mock button that bypasses live verification
  mockVerification:
    (process.env.NEXT_PUBLIC_SELF_MOCK_VERIFICATION || "").toLowerCase() ===
    "true",
};

export type SelfFrontendConfig = typeof SELF_CONFIG;
