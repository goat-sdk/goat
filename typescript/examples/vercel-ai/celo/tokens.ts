import { Token } from "@goat-sdk/plugin-celo";

export const tokens: Token[] = [
    {
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
        chains: {
            "42220": {
                contractAddress: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
            },
        },
    },
    {
        decimals: 18,
        symbol: "CELO",
        name: "Celo",
        chains: {
            "42220": {
                contractAddress: "0x471EcE3750Da237f93B8E339c536989b8978a438",
            },
        },
    },
    {
        decimals: 18,
        symbol: "cUSD",
        name: "Celo Dollar",
        chains: {
            "42220": {
                contractAddress: "0x765de816845861e75a25fca122bb6898b8b1282a",
            },
        },
    },
];
