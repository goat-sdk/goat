import {
    type Chain,
    arbitrum,
    arbitrumSepolia,
    avalancheFuji,
    base,
    baseSepolia,
    optimism,
    optimismSepolia,
    polygon,
    polygonAmoy,
    sepolia,
    skaleNebulaTestnet,
    victionTestnet,
} from "viem/chains";

const faucetChains = [
    "arbitrum-sepolia",
    "avalanche-fuji",
    "base-sepolia",
    "ethereum-sepolia",
    "optimism-sepolia",
    "polygon-amoy",
    "skale-nebula-testnet",
    "viction-testnet",
] as const;

type SupportedFaucetChains = (typeof faucetChains)[number];

const smartWalletChains = [
    "polygon",
    "polygon-amoy",
    "base",
    "base-sepolia",
    "arbitrum",
    "arbitrum-sepolia",
    "optimism",
    "optimism-sepolia",
] as const;

export type SupportedSmartWalletChains = (typeof smartWalletChains)[number];

const chainMap: Record<SupportedFaucetChains | SupportedSmartWalletChains, Chain> = {
    arbitrum: arbitrum,
    "arbitrum-sepolia": arbitrumSepolia,
    base: base,
    "base-sepolia": baseSepolia,
    optimism: optimism,
    "optimism-sepolia": optimismSepolia,
    polygon: polygon,
    "polygon-amoy": polygonAmoy,
    "avalanche-fuji": avalancheFuji,
    "ethereum-sepolia": sepolia,
    "skale-nebula-testnet": skaleNebulaTestnet,
    "viction-testnet": victionTestnet,
};

export function getViemChain(chain: SupportedSmartWalletChains | SupportedFaucetChains): Chain {
    const viemChain = chainMap[chain];
    if (!viemChain) {
        throw new Error(`Unsupported chain: ${chain}`);
    }
    return viemChain;
}

const testnetChains = ["arbitrum-sepolia", "base-sepolia", "optimism-sepolia", "polygon-amoy"] as const;

export function getEnv(chain: SupportedSmartWalletChains): "staging" | "production" {
    return (testnetChains as readonly string[]).includes(chain) ? "staging" : "production";
}

const faucetChainIds = new Set(faucetChains.map((chainName) => chainMap[chainName].id));

export function isChainSupportedByFaucet(chainId: number): boolean {
    return faucetChainIds.has(chainId);
}
