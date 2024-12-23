// typescript/packages/plugins/ionic/src/config.ts
export const ionicProtocolAddresses: {
    [chainId: number]: {
        pools: {
            [poolId: string]: `0x${string}`;
        };
        assets: {
            [symbol: string]: {
                address?: `0x${string}`;
                decimals?: number;
            };
        };
    };
} = {
    // Example configuration for Mode network (chain ID 34443)
    34443: {
        pools: {
            "1": "0x8991Ce853Ad43c7341837378f2c32144A7997871",
        },
        assets: {
            "USDC": { address: "0x0Bf9504B1bb54788b718D0219945816849f7c348", decimals: 6 },
            "WETH": { address: "0x8a198730128999933d070135034f24909867ad2a", decimals: 18 },
            "MODE": { address: "0xe77fb5c088b194c46695780322d39c791d5ada16", decimals: 18 },
        },
    },
    // Add configurations for other supported networks (Base, Optimism, etc.)
    8453: { // Base
        pools: {
            "1": "0x...", // Replace with actual Base pool contract address
        },
        assets: {
            "USDC": { address: "0x...", decimals: 6 }, // Replace with actual Base USDC address
            "WETH": { address: "0x...", decimals: 18 }, // Replace with actual Base WETH address
        },
    },
    10: { // Optimism
        pools: {
            "1": "0x...", // Replace with actual Optimism pool contract address
        },
        assets: {
            "USDC": { address: "0x...", decimals: 6 }, // Replace with actual Optimism USDC address
            "WETH": { address: "0x...", decimals: 18 }, // Replace with actual Optimism WETH address
        },
    },
};