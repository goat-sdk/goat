export const SOLANA_SUPPORTED_CURRENCIES = ["eurc", "bonk", "wif", "mother", "sol", "usdc"] as const;

export const EVM_SUPPORTED_CURRENCIES = [
    "eth",
    "matic",
    "pol",
    "chz",
    "avax",
    "xai",
    "fuel",
    "vic",
    "usdc",
    "usdce",
    "busd",
    "usdxm",
    "weth",
    "degen",
    "brett",
    "toshi",
    "eurc",
    "bnb",
    "sfuel",
] as const;

export const OTHER_CHAIN_SUPPORTED_CURRENCIES = ["sui", "sei", "ada", "apt"] as const;

export const SUPPORTED_CURRENCIES = [
    ...EVM_SUPPORTED_CURRENCIES,
    ...SOLANA_SUPPORTED_CURRENCIES,
    ...OTHER_CHAIN_SUPPORTED_CURRENCIES,
] as const;

export type SupportedEVMCurrency = (typeof EVM_SUPPORTED_CURRENCIES)[number];
export type SupportedSolanaCurrency = (typeof SOLANA_SUPPORTED_CURRENCIES)[number];
export type SupportedOtherCurrency = (typeof OTHER_CHAIN_SUPPORTED_CURRENCIES)[number];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
