import { defineChain } from "viem";

export const lens_testnet = /*#__PURE__*/ defineChain({
    id: 37111,
    name: "Lens Testnet",
    network: "Lens Network Sepolia Testnet",
    nativeCurrency: {
        name: "GRASS",
        symbol: "GSS",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.testnet.lens.dev"],
        },
    },
    blockExplorers: {
        default: {
            name: "Lens Explorer",
            url: "https://block-explorer.testnet.lens.dev",
            apiUrl: "https://block-explorer-api.staging.lens.dev",
        },
    },
    testnet: false,
});
