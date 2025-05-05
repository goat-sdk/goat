import { coingecko } from "../src/coingecko.plugin";
import { getTools } from "@goat-sdk/core";

const wallet = {
    getChain: () => ({
        id: 1,
        name: "Ethereum",
        rpcUrls: [],
        type: "radix" as const,
    }),
    getAccounts: () => [
        {
            address: "0x0",
            balance: {
                amount: "28150.34",
                decimals: 18,
                symbol: "ETH",
                name: "Ether",
                value: "10",
                inBaseUnits: "0",
            },
        },
    ],
    signMessage: async () => ({ signature: "stub" }),
    getAddress: () => "0x0",
    balanceOf: async () => ({
        amount: "0",
        decimals: 18,
        symbol: "ETH",
        name: "Ether",
        value: "0",
        inBaseUnits: "0",
    }),
    getCoreTools: () => [],
};

async function main() {
    const plugin = coingecko({
        apiKey: "test-api-key",
        isPro: true,
    });

    const tools = await getTools({
        wallet: wallet,
        plugins: [plugin],
    });

    // Use IntelliSense-friendly services object
    const result = await plugin.services.getTrendingPoolsByNetwork({ network: "eth" });
    console.log("Trending Pools by Network:", result);
}

main().catch((err) => {
    console.error("Error:", err.message);
});