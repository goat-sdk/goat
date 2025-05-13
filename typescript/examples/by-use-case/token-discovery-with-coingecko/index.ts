import { coinGeckoTokenDiscovery } from "@goat-sdk/plugin-coingecko-token-discovery";
import { solana } from "@goat-sdk/wallet-solana";
import { viem } from "@goat-sdk/wallet-viem";
import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { config } from "dotenv";
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

config();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const EVM_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
const EVM_RPC_URL = process.env.RPC_PROVIDER_URL as string;
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY as string;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;

if (!COINGECKO_API_KEY) {
	console.error("COINGECKO_API_KEY environment variable is required");
	process.exit(1);
}
if (!EVM_PRIVATE_KEY || !EVM_RPC_URL) {
	console.error(
		"WALLET_PRIVATE_KEY and RPC_PROVIDER_URL environment variables are required for EVM",
	);
	process.exit(1);
}
if (!SOLANA_PRIVATE_KEY || !SOLANA_RPC_URL) {
	console.error(
		"SOLANA_PRIVATE_KEY and SOLANA_RPC_URL environment variables are required for Solana",
	);
	process.exit(1);
}

async function main() {
	try {
		console.log("🔍 Testing CoinGecko Token Discovery Plugin with EVM wallet");

		const account = privateKeyToAccount(EVM_PRIVATE_KEY);
		const walletClient = createWalletClient({
			account: account,
			transport: http(EVM_RPC_URL),
			chain: sepolia,
		});
		const evmWalletClient = viem(walletClient);

		const coinGeckoPlugin = coinGeckoTokenDiscovery({
			apiKey: COINGECKO_API_KEY,
		});

		const evmTools = await coinGeckoPlugin.getTools(evmWalletClient);

		const getTokenInfoByTickerTool = evmTools.find(
			(tool) => tool.name === "get_token_info_by_ticker",
		);

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

		console.log(
			"\n\n🔍 Testing CoinGecko Token Discovery Plugin with Solana wallet",
		);

		const connection = new Connection(SOLANA_RPC_URL);
		const keypair = Keypair.fromSecretKey(base58.decode(SOLANA_PRIVATE_KEY));
		const solWalletClient = solana({
			keypair,
			connection,
		});

		const solTools = await coinGeckoPlugin.getTools(solWalletClient);

		const getTokenInfoBySymbolTool = solTools.find(
			(tool) => tool.name === "get_token_info_by_symbol",
		);

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
