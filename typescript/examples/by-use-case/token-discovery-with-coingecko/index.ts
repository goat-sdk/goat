import { coinGeckoTokenDiscovery } from "@goat-sdk/plugins-coingecko-token-discovery";
import { evmKeyPair } from "@goat-sdk/wallets-evm";
import { solanaKeypair } from "@goat-sdk/wallets-solana";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { config } from "dotenv";

config();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

if (!COINGECKO_API_KEY) {
    console.error("COINGECKO_API_KEY environment variable is required");
    process.exit(1);
}

async function main() {
    try {
        console.log("🔍 Testing CoinGecko Token Discovery Plugin with EVM wallet");

        const evmWalletClient = evmKeyPair({
            privateKey: "0x1234567890123456789012345678901234567890123456789012345678901234", // Demo private key
            chain: "sepolia",
            rpcUrl: "https://ethereum-sepolia.publicnode.com",
        });

        const coinGeckoPlugin = coinGeckoTokenDiscovery({
            apiKey: COINGECKO_API_KEY,
        });

        const evmTools = await coinGeckoPlugin.getTools(evmWalletClient);

        const getTokenInfoByTickerTool = evmTools.find((tool) => tool.name === "get_token_info_by_ticker");

        if (!getTokenInfoByTickerTool) {
            throw new Error("get_token_info_by_ticker tool not found in plugin");
        }

        console.log("\nLooking up EVM tokens:");

        const evmTokens = ["ETH", "USDC", "PEPE"];

        for (const ticker of evmTokens) {
            console.log(`\nLooking up ${ticker}...`);
            try {
                const tokenInfo = await getTokenInfoByTickerTool.execute({ ticker });
                console.log(`Token info for ${ticker}:`, tokenInfo);
            } catch (error) {
                console.error(`Error looking up ${ticker}:`, error);
            }
        }

        console.log("\n\n🔍 Testing CoinGecko Token Discovery Plugin with Solana wallet");

        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        const solWalletClient = solanaKeypair({
            connection,
            keypair: {
                publicKey: "DemoPublicKeyNotRealXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                secretKey: new Uint8Array(64).fill(1), // Demo key
            },
        });

        const solTools = await coinGeckoPlugin.getTools(solWalletClient);

        const getTokenInfoBySymbolTool = solTools.find((tool) => tool.name === "get_token_info_by_symbol");

        if (!getTokenInfoBySymbolTool) {
            throw new Error("get_token_info_by_symbol tool not found in plugin");
        }

        console.log("\nLooking up Solana tokens:");

        const solTokens = ["SOL", "USDC", "BONK"];

        for (const symbol of solTokens) {
            console.log(`\nLooking up ${symbol}...`);
            try {
                const tokenInfo = await getTokenInfoBySymbolTool.execute({ symbol });
                console.log(`Token info for ${symbol}:`, tokenInfo);
            } catch (error) {
                console.error(`Error looking up ${symbol}:`, error);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
