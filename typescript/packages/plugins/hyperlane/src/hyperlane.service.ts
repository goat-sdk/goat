import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { GithubRegistry } from "@hyperlane-xyz/registry";
import {
    HypERC20Deployer,
    HyperlaneContractsMap,
    MultiProvider,
    TOKEN_TYPE_TO_STANDARD,
    TokenFactories,
    TokenType,
    WarpCoreConfig,
    WarpRouteDeployConfig,
    WarpRouteDeployConfigSchema,
    getTokenConnectionId,
    isCollateralTokenConfig,
    isTokenMetadata,
} from "@hyperlane-xyz/sdk";
import { assert, ProtocolType } from "@hyperlane-xyz/utils";
import ethers from "ethers";
import { HyperlaneDeployParameters } from "./parameters";

import * as dotenv from "dotenv";
dotenv.config();

const REGISTRY_URL = "https://github.com/hyperlane-xyz/hyperlane-registry";
const REGISTRY_PROXY_URL = "https://proxy.hyperlane.xyz";

export class HyperlaneService {
    @Tool({
        name: "hyperlane",
        description: "Hyperlane creates bridges (aka warp routes) permissionlessly.",
    })
    async deployBridge(walletClient: EVMWalletClient, parameters: HyperlaneDeployParameters) {
        assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

        const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
        const { multiProvider, registry } = await getMultiProvider(wallet);

        const { origin, destination, token } = parameters;
        const owner = walletClient.getAddress();

        const chainAddresses = await registry.getAddresses();
        const warpDeployConfig: WarpRouteDeployConfig = {
            [origin]: {
                type: TokenType.collateral,
                token,
                owner,
                mailbox: chainAddresses[origin].mailbox,
            },
            [destination]: {
                type: TokenType.synthetic,
                owner,
                mailbox: chainAddresses[destination].mailbox,
            },
        };
        WarpRouteDeployConfigSchema.parse(warpDeployConfig);

        const deployedContracts = await new HypERC20Deployer(multiProvider).deploy(warpDeployConfig);
        const warpCoreConfig = await getWarpCoreConfig(multiProvider, warpDeployConfig, deployedContracts);

        return `Contracts deployed ${JSON.stringify(warpCoreConfig, null, 2)}`;
    }
}

async function getMultiProvider(signer?: ethers.Signer) {
    const registry = new GithubRegistry({
        uri: REGISTRY_URL,
        proxyUrl: REGISTRY_PROXY_URL,
    });
    const chainMetadata = await registry.getMetadata();
    const multiProvider = new MultiProvider(chainMetadata);
    if (signer) multiProvider.setSharedSigner(signer);
    return { multiProvider, registry };
}

async function getWarpCoreConfig(
    multiProvider: MultiProvider,
    warpDeployConfig: WarpRouteDeployConfig,
    contracts: HyperlaneContractsMap<TokenFactories>,
): Promise<WarpCoreConfig> {
    const warpCoreConfig: WarpCoreConfig = { tokens: [] };

    const tokenMetadata = await HypERC20Deployer.deriveTokenMetadata(multiProvider, warpDeployConfig);
    assert(tokenMetadata && isTokenMetadata(tokenMetadata), "Missing required token metadata");
    const { decimals, symbol, name } = tokenMetadata;
    assert(decimals, "Missing decimals on token metadata");

    generateTokenConfigs(warpCoreConfig, warpDeployConfig, contracts, symbol, name, decimals);

    fullyConnectTokens(warpCoreConfig);

    return warpCoreConfig;
}

/**
 * Creates token configs.
 */
function generateTokenConfigs(
    warpCoreConfig: WarpCoreConfig,
    warpDeployConfig: WarpRouteDeployConfig,
    contracts: HyperlaneContractsMap<TokenFactories>,
    symbol: string,
    name: string,
    decimals: number,
): void {
    for (const [chainName, contract] of Object.entries(contracts)) {
        const config = warpDeployConfig[chainName];
        const collateralAddressOrDenom = isCollateralTokenConfig(config)
            ? config.token // gets set in the above deriveTokenMetadata()
            : undefined;

        warpCoreConfig.tokens.push({
            chainName,
            standard: TOKEN_TYPE_TO_STANDARD[config.type],
            decimals,
            symbol,
            name,
            addressOrDenom: contract[warpDeployConfig[chainName].type as keyof TokenFactories].address,
            collateralAddressOrDenom,
        });
    }
}

/**
 * Adds connections between tokens.
 * Assumes full interconnectivity between all tokens for now b.c. that's
 * what the deployers do by default.
 */
function fullyConnectTokens(warpCoreConfig: WarpCoreConfig): void {
    for (const token1 of warpCoreConfig.tokens) {
        for (const token2 of warpCoreConfig.tokens) {
            if (token1.chainName === token2.chainName && token1.addressOrDenom === token2.addressOrDenom) continue;
            token1.connections ||= [];
            assert(token2.addressOrDenom, "Invalid token2 address");
            token1.connections.push({
                token: getTokenConnectionId(ProtocolType.Ethereum, token2.chainName, token2.addressOrDenom),
            });
        }
    }
}
