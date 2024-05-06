export const SUPPORTED_CHAINS = [1, 10, 42161] as const;

export type SupportedChainsType = (typeof SUPPORTED_CHAINS)[number];

export const PRICE_ORACLE_V3_ADDRESSES: Record<SupportedChainsType, string> = {
  1: "0x599f585D1042A14aAb194AC8031b2048dEFdFB85",
  42161: "0xF6C709a419e18819dea30248f59c95cA20fd83d5",
  10: "0xbb3970A9E68ce2e2Dc39fE702A3ad82cfD0eDE7F",
};

export const RPC_URLS: Record<SupportedChainsType, string> = {
  1: `https://eth-mainnet.g.alchemy.com/v2/hdj5sOLxfKqg_SNJ9OGigEGlfsprr8wN`,
  42161: `https://arb-mainnet.g.alchemy.com/v2/hdj5sOLxfKqg_SNJ9OGigEGlfsprr8wN`,
  10: `https://opt-mainnet.g.alchemy.com/v2/hdj5sOLxfKqg_SNJ9OGigEGlfsprr8wN`,
};

export const SAFE_SIGNER_PRIVATE_KEY =
  process.env.SAFE_SIGNER_PRIVATE_KEY ?? "";
export const SAFE_ADDRESS = "0x";
