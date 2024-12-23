import { defineChain } from "viem";

export const mode = defineChain({
    id: 34443,
    name: "Mode",
    network: "mode",
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    rpcUrls: {
        default: { http: ["https://mainnet.mode.network"] },
        public: { http: ["https://mainnet.mode.network"] },
    },
    blockExplorers: {
        default: { name: "Mode Explorer", url: "https://explorer.mode.network" },
    },
    contracts: {
        multicall3: {
            address: "0xca11bde05977b3631167028862be2a173976ca11",
            blockCreated: 1,
        },
    },
});
