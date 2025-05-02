import type { Token, WalletClientBase } from "@goat-sdk/core";
import { Tool } from "@goat-sdk/core";
import type { CoinGeckoTokenDiscoveryAPI } from "./api";
import type { GetTokenInfoByTickerParameters } from "./parameters";

// Global mapping of CoinGecko platform identifiers to chain IDs or chain names
const PLATFORM_TO_CHAIN_ID: Record<string, number | string> = {
	// EVM chains
	ethereum: 1,
	"polygon-pos": 137,
	"optimistic-ethereum": 10,
	"arbitrum-one": 42161,
	base: 8453,
	celo: 42220,
	avalanche: 43114,
	"binance-smart-chain": 56,
	fantom: 250,
	cronos: 25,
	palm: 11297108109,
	"metis-andromeda": 1088,
	aurora: 1313161554,
	moonbeam: 1284,
	moonriver: 1285,
	"arbitrum-nova": 42170,
	"harmony-shard-0": 1666600000,
	kava: 2222,
	gnosis: 100,
	zksync: 324,
	linea: 59144,
	zksyncerabetatest: 300,
	iotex: 4689,
	oasis: 42262,
	conflux: 1030,
	boba: 288,
	astar: 592,
	evmos: 9001,
	dogechain: 2000,
	klaytn: 8217,
	fuse: 122,

	// Non-EVM chains
	solana: "solana",
	tron: "tron",
	stellar: "stellar",
	algorand: "algorand",
	aptos: "aptos",
	sui: "sui",
	"near-protocol": "near",
	"hedera-hashgraph": "hedera",
	polkadot: "polkadot",
	cardano: "cardano",
	flow: "flow",
	elrond: "elrond",
	tezos: "tezos",
	cosmos: "cosmos",
	osmosis: "osmosis",
	stacks: "stacks",
	ronin: "ronin",
	wax: "wax",
	waves: "waves",
	zilliqa: "zilliqa",
	secret: "secret",
	chiliz: "chiliz",
	thorchain: "thorchain",
	canto: "canto",
	"hoo-smart-chain": "hoo",
	sora: "sora",
	icon: "icon",
	"okex-chain": "okex",
	"kucoin-community-chain": "kucoin",
	"huobi-token": "huobi",
	terra: "terra",
	vechain: "vechain",
};

interface EVMTokenInfo {
	symbol: string;
	contractAddress: string;
	decimals: number;
	name: string;
}

interface SolanaTokenInfo {
	symbol: string;
	mintAddress: string;
	decimals: number;
	name: string;
}

interface CoinGeckoCoin {
	id: string;
	symbol: string;
	name: string;
}

interface CoinGeckoSearchResult {
	coins: CoinGeckoCoin[];
}

interface CoinGeckoTokenDetails {
	id: string;
	symbol: string;
	name: string;
	platforms: Record<string, string>;
}

export class TokenDiscoveryService {
	constructor(protected api: CoinGeckoTokenDiscoveryAPI) {}

	@Tool({
		name: "get_token_info_by_ticker",
		description:
			"Get information about a token by its ticker symbol using CoinGecko data.",
	})
	async getTokenInfoByTicker<T extends Token>(
		walletClient: WalletClientBase,
		parameters: GetTokenInfoByTickerParameters,
	): Promise<T> {
		const { ticker } = parameters as unknown as { ticker: string };

		try {
			const searchResult = (await this.api.request("search", {
				query: ticker,
			})) as CoinGeckoSearchResult;

			if (!searchResult.coins || searchResult.coins.length === 0) {
				return walletClient.getTokenInfoByTicker(ticker) as Promise<T>;
			}

			const exactMatch = searchResult.coins.find(
				(coin) => coin.symbol.toLowerCase() === ticker.toLowerCase(),
			);

			const bestMatch = exactMatch || searchResult.coins[0];

			const tokenDetails = (await this.api.request(`coins/${bestMatch.id}`, {
				localization: false,
				tickers: false,
				market_data: true,
				community_data: false,
				developer_data: false,
			})) as CoinGeckoTokenDetails;

			if (!tokenDetails || !tokenDetails.platforms) {
				return walletClient.getTokenInfoByTicker(ticker) as Promise<T>;
			}

			const chain = walletClient.getChain();
			let chainId: number | string;

			if (chain.type === "solana") {
				chainId = "solana";
			} else if ("id" in chain) {
				chainId =
					typeof chain.id === "number" ? chain.id : Number.parseInt(chain.id);
			} else {
				// Default case - use chain.type as fallback
				chainId = chain.type;
			}

			let contractAddress = "";
			for (const [platform, address] of Object.entries(
				tokenDetails.platforms,
			)) {
				if (PLATFORM_TO_CHAIN_ID[platform] === chainId && address) {
					contractAddress = address;
					break;
				}
			}

			if (!contractAddress) {
				return walletClient.getTokenInfoByTicker(ticker) as Promise<T>;
			}

			return {
				symbol: bestMatch.symbol.toUpperCase(),
				contractAddress,
				decimals: 18, // Default to 18 as most ERC20 tokens use this (ideally would verify)
				name: bestMatch.name,
			} as unknown as T;
		} catch (error) {
			console.error(`Error fetching token info for ${ticker}: ${error}`);
			return walletClient.getTokenInfoByTicker(ticker) as Promise<T>;
		}
	}
}
