import { createPublicClient, http, parseUnits } from "viem";
import type { GetQuoteParameters, SwapParameters, ZapInParameters } from "./parameters";

// ─── Constants ───────────────────────────────────────────────────────────────

const CLIENT_SOURCE = "ai-agent-goat";
const REQUEST_TIMEOUT_MS = 15_000;
const NATIVE_SENTINEL = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const API_BASES = {
  aggregator: "https://aggregator-api.kyberswap.com",
  token: "https://token-api.kyberswap.com",
  zapApi: "https://zap-api.kyberswap.com",
} as const;

// ─── Chain config ─────────────────────────────────────────────────────────────

interface ChainConfig {
  chainId: number;
  slug: string;
  nativeSymbol: string;
  wrappedNative: string;
  defaultRpcUrl: string;
}

const CHAINS: Record<string, ChainConfig> = {
  ethereum: { chainId: 1, slug: "ethereum", nativeSymbol: "ETH", wrappedNative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", defaultRpcUrl: "https://eth.llamarpc.com" },
  bsc: { chainId: 56, slug: "bsc", nativeSymbol: "BNB", wrappedNative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", defaultRpcUrl: "https://bsc-dataseed.binance.org" },
  arbitrum: { chainId: 42161, slug: "arbitrum", nativeSymbol: "ETH", wrappedNative: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", defaultRpcUrl: "https://arb1.arbitrum.io/rpc" },
  polygon: { chainId: 137, slug: "polygon", nativeSymbol: "POL", wrappedNative: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", defaultRpcUrl: "https://polygon-rpc.com" },
  optimism: { chainId: 10, slug: "optimism", nativeSymbol: "ETH", wrappedNative: "0x4200000000000000000000000000000000000006", defaultRpcUrl: "https://mainnet.optimism.io" },
  base: { chainId: 8453, slug: "base", nativeSymbol: "ETH", wrappedNative: "0x4200000000000000000000000000000000000006", defaultRpcUrl: "https://mainnet.base.org" },
  avalanche: { chainId: 43114, slug: "avalanche", nativeSymbol: "AVAX", wrappedNative: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", defaultRpcUrl: "https://api.avax.network/ext/bc/C/rpc" },
  linea: { chainId: 59144, slug: "linea", nativeSymbol: "ETH", wrappedNative: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f", defaultRpcUrl: "https://rpc.linea.build" },
  mantle: { chainId: 5000, slug: "mantle", nativeSymbol: "MNT", wrappedNative: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", defaultRpcUrl: "https://rpc.mantle.xyz" },
  sonic: { chainId: 146, slug: "sonic", nativeSymbol: "S", wrappedNative: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", defaultRpcUrl: "https://rpc.soniclabs.com" },
  berachain: { chainId: 80094, slug: "berachain", nativeSymbol: "BERA", wrappedNative: "0x6969696969696969696969696969696969696969", defaultRpcUrl: "https://rpc.berachain.com" },
  ronin: { chainId: 2020, slug: "ronin", nativeSymbol: "RON", wrappedNative: "0xe514d9DEB7966c8BE0ca922de8a064264eA6bcd4", defaultRpcUrl: "https://api.roninchain.com/rpc" },
  unichain: { chainId: 130, slug: "unichain", nativeSymbol: "ETH", wrappedNative: "0x4200000000000000000000000000000000000006", defaultRpcUrl: "https://rpc.unichain.org" },
  hyperevm: { chainId: 999, slug: "hyperevm", nativeSymbol: "ETH", wrappedNative: "0x4200000000000000000000000000000000000006", defaultRpcUrl: "https://rpc.hyperliquid.xyz/evm" },
  monad: { chainId: 143, slug: "monad", nativeSymbol: "MON", wrappedNative: "0x4200000000000000000000000000000000000006", defaultRpcUrl: "https://rpc.monad.xyz" },
};

const CHAIN_BY_ID: Record<number, ChainConfig> = Object.fromEntries(
  Object.values(CHAINS).map((c) => [c.chainId, c]),
);

function resolveChain(input: string): ChainConfig {
  const lower = input.toLowerCase();
  if (CHAINS[lower]) return CHAINS[lower];
  const id = parseInt(input, 10);
  if (!isNaN(id) && CHAIN_BY_ID[id]) return CHAIN_BY_ID[id];
  throw new Error(`Unsupported chain "${input}". Supported: ${Object.keys(CHAINS).join(", ")}`);
}

// ─── Token resolution ─────────────────────────────────────────────────────────

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

const ERC20_ABI = [
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
] as const;

// Minimal registry for common tokens — avoids API round-trips for the most frequent pairs
const TOKEN_REGISTRY: Record<string, Record<string, TokenInfo>> = {
  ethereum: {
    ETH: { address: NATIVE_SENTINEL, symbol: "ETH", decimals: 18 },
    WETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18 },
    USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
    DAI: { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
    WBTC: { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8 },
    STETH: { address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", symbol: "stETH", decimals: 18 },
    WSTETH: { address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", symbol: "wstETH", decimals: 18 },
    LINK: { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18 },
    UNI: { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", decimals: 18 },
    AAVE: { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", decimals: 18 },
  },
  arbitrum: {
    ETH: { address: NATIVE_SENTINEL, symbol: "ETH", decimals: 18 },
    WETH: { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", decimals: 18 },
    USDC: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6 },
    "USDC.E": { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", symbol: "USDC.e", decimals: 6 },
    USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6 },
    WBTC: { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", symbol: "WBTC", decimals: 8 },
    ARB: { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", symbol: "ARB", decimals: 18 },
    DAI: { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18 },
  },
  base: {
    ETH: { address: NATIVE_SENTINEL, symbol: "ETH", decimals: 18 },
    WETH: { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18 },
    USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6 },
    DAI: { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", decimals: 18 },
  },
  polygon: {
    POL: { address: NATIVE_SENTINEL, symbol: "POL", decimals: 18 },
    MATIC: { address: NATIVE_SENTINEL, symbol: "POL", decimals: 18 },
    WPOL: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", symbol: "WPOL", decimals: 18 },
    USDC: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC", decimals: 6 },
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6 },
    WETH: { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH", decimals: 18 },
    WBTC: { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", decimals: 8 },
  },
  bsc: {
    BNB: { address: NATIVE_SENTINEL, symbol: "BNB", decimals: 18 },
    WBNB: { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB", decimals: 18 },
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18 },
    USDT: { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18 },
    ETH: { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "ETH", decimals: 18 },
  },
  optimism: {
    ETH: { address: NATIVE_SENTINEL, symbol: "ETH", decimals: 18 },
    WETH: { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18 },
    USDC: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC", decimals: 6 },
    USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", decimals: 6 },
    OP: { address: "0x4200000000000000000000000000000000000042", symbol: "OP", decimals: 18 },
  },
  avalanche: {
    AVAX: { address: NATIVE_SENTINEL, symbol: "AVAX", decimals: 18 },
    WAVAX: { address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", symbol: "WAVAX", decimals: 18 },
    USDC: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", decimals: 6 },
    USDT: { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", decimals: 6 },
  },
};

const NATIVE_ALIASES: Record<string, Set<string>> = {
  ethereum: new Set(["ETH", "ETHER"]),
  arbitrum: new Set(["ETH", "ETHER"]),
  optimism: new Set(["ETH", "ETHER"]),
  base: new Set(["ETH", "ETHER"]),
  linea: new Set(["ETH", "ETHER"]),
  unichain: new Set(["ETH", "ETHER"]),
  hyperevm: new Set(["ETH", "ETHER"]),
  monad: new Set(["MON"]),
  bsc: new Set(["BNB"]),
  polygon: new Set(["POL", "MATIC"]),
  avalanche: new Set(["AVAX"]),
  mantle: new Set(["MNT"]),
  sonic: new Set(["S"]),
  berachain: new Set(["BERA"]),
  ronin: new Set(["RON"]),
};

function isAddress(input: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(input);
}

async function resolveAddressToken(address: string, chain: ChainConfig): Promise<TokenInfo> {
  if (address.toLowerCase() === NATIVE_SENTINEL.toLowerCase()) {
    return { address: NATIVE_SENTINEL, symbol: chain.nativeSymbol, decimals: 18 };
  }

  const byAddress = Object.values(TOKEN_REGISTRY[chain.slug] ?? {}).find(
    (t) => t.address.toLowerCase() === address.toLowerCase(),
  );
  if (byAddress) return byAddress;

  const rpcUrl =
    process.env[`RPC_URL_${chain.slug.toUpperCase()}`] ?? chain.defaultRpcUrl;
  const client = createPublicClient({ transport: http(rpcUrl) });
  const [decimals, symbol] = await Promise.all([
    client.readContract({ address: address as `0x${string}`, abi: ERC20_ABI, functionName: "decimals" }),
    client.readContract({ address: address as `0x${string}`, abi: ERC20_ABI, functionName: "symbol" }),
  ]);
  return { address, symbol: symbol as string, decimals: Number(decimals) };
}

async function resolveToken(input: string, chain: ChainConfig): Promise<TokenInfo> {
  const upper = input.trim().toUpperCase();

  if (NATIVE_ALIASES[chain.slug]?.has(upper)) {
    return { address: NATIVE_SENTINEL, symbol: chain.nativeSymbol, decimals: 18 };
  }

  const registry = TOKEN_REGISTRY[chain.slug];
  if (registry?.[upper]) return registry[upper];

  if (isAddress(input)) return resolveAddressToken(input, chain);

  // Fall back to KyberSwap Token API
  const url = new URL("/api/v1/tokens", API_BASES.token);
  url.searchParams.set("query", input);
  url.searchParams.set("chainIds", chain.chainId.toString());
  const res = await kyberFetch<any>(url.toString());
  const tokens: any[] = res?.data?.tokens ?? [];
  const match = tokens.find((t: any) => t.symbol?.toUpperCase() === upper);
  if (match) {
    return { address: match.address, symbol: match.symbol, decimals: match.decimals ?? 18 };
  }

  throw new Error(
    `Token "${input}" not found on ${chain.slug}. Provide the contract address if it's a new or obscure token.`,
  );
}

// ─── Slippage ─────────────────────────────────────────────────────────────────

const STABLECOINS = new Set([
  "USDC", "USDT", "DAI", "BUSD", "FRAX", "LUSD", "TUSD", "USDD",
  "PYUSD", "DOLA", "EUSD", "USD+", "USDC.E", "USDT.E",
]);
const COMMON_TOKENS = new Set([
  "ETH", "WETH", "BTC", "WBTC", "BNB", "WBNB", "MATIC", "POL",
  "AVAX", "LINK", "AAVE", "UNI", "MKR", "STETH", "WSTETH", "ARB", "OP",
]);

function getDefaultSlippage(symbolIn: string, symbolOut: string): number {
  const a = symbolIn.toUpperCase();
  const b = symbolOut.toUpperCase();
  if (STABLECOINS.has(a) && STABLECOINS.has(b)) return 5;
  if (COMMON_TOKENS.has(a) || COMMON_TOKENS.has(b)) return 50;
  return 100;
}

// ─── Format utils ─────────────────────────────────────────────────────────────

function toWei(amount: string, decimals: number): string {
  return parseUnits(amount.replace(/,/g, ""), decimals).toString();
}

function fromWei(wei: string, decimals: number): string {
  if (decimals === 0) return wei;
  const padded = wei.padStart(decimals + 1, "0");
  const intPart = padded.slice(0, padded.length - decimals);
  const fracPart = padded.slice(padded.length - decimals).replace(/0+$/, "");
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

async function kyberFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "X-Client-Id": CLIENT_SOURCE,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`KyberSwap API ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (e.name === "AbortError") throw new Error(`KyberSwap API timed out (${url})`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function kyberGet<T>(baseUrl: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(path, baseUrl);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  return kyberFetch<T>(url.toString(), { method: "GET" });
}

function kyberPost<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  return kyberFetch<T>(new URL(path, baseUrl).toString(), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Return types ─────────────────────────────────────────────────────────────

export interface QuoteResult {
  tokenIn: { symbol: string; address: string; amount: string; amountUsd: string };
  tokenOut: { symbol: string; address: string; amount: string; amountUsd: string };
  exchangeRate: string;
  gas: { estimated: string; estimatedUsd: string };
  suggestedSlippage: string;
  routerAddress: string;
  chain: string;
  note: string;
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gas: string;
}

export interface SwapBuildResult {
  transaction: SwapTransaction;
  quote: QuoteResult;
}

export interface ZapBuildResult {
  transaction: SwapTransaction & { approvalTarget: string; tokenTarget: string };
  chain: string;
  pool: string;
  dex: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class KyberswapService {
  async getQuote(params: InstanceType<typeof GetQuoteParameters>): Promise<QuoteResult> {
    const chain = resolveChain(params.chain);
    const [tokenIn, tokenOut] = await Promise.all([
      resolveToken(params.tokenIn, chain),
      resolveToken(params.tokenOut, chain),
    ]);
    const amountInWei = toWei(params.amountIn, tokenIn.decimals);

    const res = await kyberGet<any>(
      API_BASES.aggregator,
      `/${chain.slug}/api/v1/routes`,
      { tokenIn: tokenIn.address, tokenOut: tokenOut.address, amountIn: amountInWei, gasInclude: "true", source: CLIENT_SOURCE },
    );

    const summary = res.data.routeSummary;
    const amountOut = fromWei(summary.amountOut, tokenOut.decimals);
    const slippage = getDefaultSlippage(tokenIn.symbol, tokenOut.symbol);

    return {
      tokenIn: { symbol: tokenIn.symbol, address: tokenIn.address, amount: params.amountIn, amountUsd: summary.amountInUsd },
      tokenOut: { symbol: tokenOut.symbol, address: tokenOut.address, amount: amountOut, amountUsd: summary.amountOutUsd },
      exchangeRate: `1 ${tokenIn.symbol} = ${(parseFloat(amountOut) / parseFloat(params.amountIn)).toFixed(6)} ${tokenOut.symbol}`,
      gas: { estimated: summary.gas, estimatedUsd: summary.gasUsd ?? "N/A" },
      suggestedSlippage: `${slippage} bps (${(slippage / 100).toFixed(2)}%)`,
      routerAddress: res.data.routerAddress,
      chain: chain.slug,
      note: "Call kyberswap_swap to execute. Approve tokenIn to routerAddress first if it is an ERC-20.",
    };
  }

  async buildSwap(
    params: InstanceType<typeof SwapParameters> & { sender: string },
  ): Promise<SwapBuildResult> {
    const chain = resolveChain(params.chain);
    const [tokenIn, tokenOut] = await Promise.all([
      resolveToken(params.tokenIn, chain),
      resolveToken(params.tokenOut, chain),
    ]);
    const amountInWei = toWei(params.amountIn, tokenIn.decimals);
    const slippage = params.slippage ?? getDefaultSlippage(tokenIn.symbol, tokenOut.symbol);
    const sender = params.sender;
    const recipient = params.recipient ?? sender;

    const routeRes = await kyberGet<any>(
      API_BASES.aggregator,
      `/${chain.slug}/api/v1/routes`,
      { tokenIn: tokenIn.address, tokenOut: tokenOut.address, amountIn: amountInWei, origin: sender, gasInclude: "true", source: CLIENT_SOURCE },
    );

    const routeSummary = routeRes.data.routeSummary;

    const buildRes = await kyberPost<any>(
      API_BASES.aggregator,
      `/${chain.slug}/api/v1/route/build`,
      {
        routeSummary,
        sender,
        recipient,
        slippageTolerance: slippage,
        deadline: Math.floor(Date.now() / 1000) + 1200,
        enableGasEstimation: true,
        source: CLIENT_SOURCE,
      },
    );

    const amountOut = fromWei(routeSummary.amountOut, tokenOut.decimals);

    return {
      transaction: {
        to: buildRes.data.routerAddress,
        data: buildRes.data.data,
        value: buildRes.data.transactionValue ?? "0",
        gas: buildRes.data.gas,
      },
      quote: {
        tokenIn: { symbol: tokenIn.symbol, address: tokenIn.address, amount: params.amountIn, amountUsd: routeSummary.amountInUsd },
        tokenOut: { symbol: tokenOut.symbol, address: tokenOut.address, amount: amountOut, amountUsd: routeSummary.amountOutUsd },
        exchangeRate: `1 ${tokenIn.symbol} = ${(parseFloat(amountOut) / parseFloat(params.amountIn)).toFixed(6)} ${tokenOut.symbol}`,
        gas: { estimated: routeSummary.gas, estimatedUsd: routeSummary.gasUsd ?? "N/A" },
        suggestedSlippage: `${slippage} bps`,
        routerAddress: buildRes.data.routerAddress,
        chain: chain.slug,
        note: "Transaction built. Broadcasting via wallet.",
      },
    };
  }

  async buildZapIn(
    params: InstanceType<typeof ZapInParameters> & { sender: string },
  ): Promise<ZapBuildResult> {
    const chain = resolveChain(params.chain);
    const tokenIn = await resolveToken(params.tokenIn, chain);
    const amountInWei = toWei(params.amountIn, tokenIn.decimals);
    const slippage = params.slippage ?? 100;
    const sender = params.sender;

    const queryParams: Record<string, string> = {
      tokensIn: tokenIn.address,
      amountsIn: amountInWei,
      "pool.id": params.pool,
      sender,
      slippage: slippage.toString(),
    };
    if (params.tickLower !== undefined) queryParams["position.tickLower"] = params.tickLower.toString();
    if (params.tickUpper !== undefined) queryParams["position.tickUpper"] = params.tickUpper.toString();
    if (params.dex) queryParams.dex = params.dex;
    if (params.positionId) queryParams.positionId = params.positionId;

    const routeRes = await kyberGet<any>(
      API_BASES.zapApi,
      `/${chain.slug}/api/v1/in/route`,
      queryParams,
    );

    const buildRes = await kyberPost<any>(
      API_BASES.zapApi,
      `/${chain.slug}/api/v1/in/route/build`,
      { sender, route: routeRes.data, deadline: Math.floor(Date.now() / 1000) + 1200, source: CLIENT_SOURCE },
    );

    const tx = buildRes.data;
    return {
      transaction: {
        to: tx.routerAddress,
        data: tx.data,
        value: tx.value ?? "0",
        gas: tx.gas,
        approvalTarget: tx.approvalTarget,
        tokenTarget: tx.tokenTarget,
      },
      chain: chain.slug,
      pool: params.pool,
      dex: params.dex ?? "auto",
    };
  }
}
