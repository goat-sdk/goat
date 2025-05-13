import type { EvalDataset } from "@goat-sdk/core";

/**
 * Dataset for testing CoinGecko trending coins tool
 */
export const COINGECKO_TRENDING_COINS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "What are the trending coins on CoinGecko?",
        },
        referenceOutputs: {
            tool: "coingecko_get_trending_coins",
            response: "{}",
        },
    },
];

/**
 * Dataset for testing CoinGecko coin prices tool
 */
export const COINGECKO_COIN_PRICES_DATASET: EvalDataset = [
    {
        inputs: {
            query: "What is the current price of Bitcoin and Ethereum in USD?",
        },
        referenceOutputs: {
            tool: "coingecko_get_coin_prices",
            response:
                '{"coinIds":["bitcoin","ethereum"],"vsCurrency":"usd","includeMarketCap":false,"include24hrVol":false,"include24hrChange":false,"includeLastUpdatedAt":false}',
        },
    },
    {
        inputs: {
            query: "Show me the price of SOL with market cap and 24h volume in EUR",
        },
        referenceOutputs: {
            tool: "coingecko_get_coin_prices",
            response:
                '{"coinIds":["solana"],"vsCurrency":"eur","includeMarketCap":true,"include24hrVol":true,"include24hrChange":false,"includeLastUpdatedAt":false}',
        },
    },
];

/**
 * Dataset for testing CoinGecko search coins tool
 */
export const COINGECKO_SEARCH_COINS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Search for coins with 'bitcoin' in the name",
        },
        referenceOutputs: {
            tool: "coingecko_search_coins",
            response: '{"query":"bitcoin"}',
        },
    },
];

/**
 * Dataset for testing CoinGecko coin price by contract address tool
 */
export const COINGECKO_COIN_PRICE_BY_CONTRACT_ADDRESS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "What is the price of the token with contract address 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 on Ethereum?",
        },
        referenceOutputs: {
            tool: "coingecko_get_coin_price_by_contract_address",
            response:
                '{"id":"ethereum","contractAddresses":["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],"vsCurrency":"usd","includeMarketCap":false,"include24hrVol":false,"include24hrChange":false,"includeLastUpdatedAt":false}',
        },
    },
];

/**
 * Dataset for testing CoinGecko coin data tool
 */
export const COINGECKO_COIN_DATA_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Get detailed information about Bitcoin",
        },
        referenceOutputs: {
            tool: "coingecko_get_coin_data",
            response:
                '{"id":"bitcoin","localization":true,"tickers":true,"marketData":true,"communityData":true,"developerData":true,"sparkline":false}',
        },
    },
];

/**
 * Dataset for testing CoinGecko historical data tool
 */
export const COINGECKO_HISTORICAL_DATA_DATASET: EvalDataset = [
    {
        inputs: {
            query: "What was the price of Ethereum on 30-12-2022?",
        },
        referenceOutputs: {
            tool: "coingecko_get_historical_data",
            response: '{"id":"ethereum","date":"30-12-2022","localization":true}',
        },
    },
];

/**
 * Dataset for testing CoinGecko OHLC data tool
 */
export const COINGECKO_OHLC_DATA_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Show me the OHLC chart data for Bitcoin for the last 7 days",
        },
        referenceOutputs: {
            tool: "coingecko_get_ohlc_data",
            response: '{"id":"bitcoin","vsCurrency":"usd","days":7}',
        },
    },
];

/**
 * Dataset for testing CoinGecko trending coin categories tool
 */
export const COINGECKO_TRENDING_COIN_CATEGORIES_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Show me trending coins in the DeFi category",
        },
        referenceOutputs: {
            tool: "coingecko_get_trending_coin_categories",
            response:
                '{"vsCurrency":"usd","ids":[],"category":"decentralized-finance-defi","order":"market_cap_desc","perPage":100,"page":1,"sparkline":false,"priceChangePercentage":"24h","locale":"en"}',
        },
    },
];

/**
 * Dataset for testing CoinGecko coin categories tool
 */
export const COINGECKO_COIN_CATEGORIES_DATASET: EvalDataset = [
    {
        inputs: {
            query: "List all coin categories on CoinGecko",
        },
        referenceOutputs: {
            tool: "coingecko_get_coin_categories",
            response: "{}",
        },
    },
];

/**
 * Dataset for testing CoinGecko Pro pool data by pool address tool
 */
export const COINGECKO_POOL_DATA_BY_POOL_ADDRESS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Get data for the Uniswap V2 ETH/USDC pool with address 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
        },
        referenceOutputs: {
            tool: "coingecko_get_pool_data_by_pool_address",
            response: '{"network":"ethereum","addresses":["0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"]}',
        },
    },
];

/**
 * Dataset for testing CoinGecko Pro trending pools tool
 */
export const COINGECKO_TRENDING_POOLS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Show me trending pools across all networks",
        },
        referenceOutputs: {
            tool: "coingecko_get_trending_pools",
            response: '{"include":["ethereum","polygon"],"page":1,"duration":"24h"}',
        },
    },
];

/**
 * Dataset for testing CoinGecko Pro trending pools by network tool
 */
export const COINGECKO_TRENDING_POOLS_BY_NETWORK_DATASET: EvalDataset = [
    {
        inputs: {
            query: "What are the trending pools on Ethereum?",
        },
        referenceOutputs: {
            tool: "coingecko_get_trending_pools_by_network",
            response: '{"network":"ethereum"}',
        },
    },
];

/**
 * Dataset for testing CoinGecko Pro top gainers losers tool
 */
export const COINGECKO_TOP_GAINERS_LOSERS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Show me the top gainers and losers in the last 24 hours",
        },
        referenceOutputs: {
            tool: "coingecko_get_top_gainers_losers",
            response: '{"vsCurrency":"usd","duration":"24h","topCoins":100}',
        },
    },
];

/**
 * Dataset for testing CoinGecko Pro token data by token address tool
 */
export const COINGECKO_TOKEN_DATA_BY_TOKEN_ADDRESS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Get data for the USDC token with address 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 on Ethereum",
        },
        referenceOutputs: {
            tool: "coingecko_get_token_data_by_token_address",
            response: '{"network":"ethereum","address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}',
        },
    },
];

/**
 * Dataset for testing CoinGecko Pro tokens info by pool address tool
 */
export const COINGECKO_TOKENS_INFO_BY_POOL_ADDRESS_DATASET: EvalDataset = [
    {
        inputs: {
            query: "Get information about all tokens in the Uniswap V2 ETH/USDC pool with address 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
        },
        referenceOutputs: {
            tool: "coingecko_get_tokens_info_by_pool_address",
            response: '{"network":"ethereum","poolAddress":"0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"}',
        },
    },
];

/**
 * Combined dataset for all CoinGecko tools
 */
export const COINGECKO_ALL_TOOLS_DATASET: EvalDataset = [
    ...COINGECKO_TRENDING_COINS_DATASET,
    ...COINGECKO_COIN_PRICES_DATASET,
    ...COINGECKO_SEARCH_COINS_DATASET,
    ...COINGECKO_COIN_PRICE_BY_CONTRACT_ADDRESS_DATASET,
    ...COINGECKO_COIN_DATA_DATASET,
    ...COINGECKO_HISTORICAL_DATA_DATASET,
    ...COINGECKO_OHLC_DATA_DATASET,
    ...COINGECKO_TRENDING_COIN_CATEGORIES_DATASET,
    ...COINGECKO_COIN_CATEGORIES_DATASET,
    ...COINGECKO_POOL_DATA_BY_POOL_ADDRESS_DATASET,
    ...COINGECKO_TRENDING_POOLS_DATASET,
    ...COINGECKO_TRENDING_POOLS_BY_NETWORK_DATASET,
    ...COINGECKO_TOP_GAINERS_LOSERS_DATASET,
    ...COINGECKO_TOKEN_DATA_BY_TOKEN_ADDRESS_DATASET,
    ...COINGECKO_TOKENS_INFO_BY_POOL_ADDRESS_DATASET,
];
