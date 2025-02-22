import { GithubRegistry } from "@hyperlane-xyz/registry";
import {
    DispatchedMessage,
    HypERC20Deployer,
    HyperlaneContractsMap,
    HyperlaneCore,
    MultiProtocolProvider,
    MultiProvider,
    ProviderType,
    TOKEN_TYPE_TO_STANDARD,
    Token,
    TokenAmount,
    TokenFactories,
    WarpCore,
    WarpCoreConfig,
    WarpRouteDeployConfig,
    getTokenConnectionId,
    isCollateralTokenConfig,
    isTokenMetadata,
} from "@hyperlane-xyz/sdk";
import { parseWarpRouteMessage } from "@hyperlane-xyz/utils";
import { ProtocolType } from "@hyperlane-xyz/utils";
import { assert } from "@hyperlane-xyz/utils";
import { ethers } from "ethers";

import * as dotenv from "dotenv";
dotenv.config();

const REGISTRY_URL = "https://github.com/hyperlane-xyz/hyperlane-registry";
const REGISTRY_PROXY_URL = "https://proxy.hyperlane.xyz";

async function sendTestTransfer() {
    // console.log("hello world");
    // assert(process.env.WALLET_PRIVATE_KEY, "Missing Private Key");

    // Deploy config: {
    //     "sepolia": {
    //         "type": "collateral",
    //             "token": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    //                 "owner": "0x047C6a8E552b52F6993994E3d47e761866cD4Ce9",
    //                     "mailbox": "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766"
    //     },
    //     "holesky": {
    //         "type": "synthetic",
    //             "owner": "0x047C6a8E552b52F6993994E3d47e761866cD4Ce9",
    //                 "mailbox": "0x46f7C5D896bbeC89bE1B19e4485e59b4Be49e9Cc"
    //     }
    // }

    // const parameters = {
    //     symbol: "ETH",
    //     chain: "base",
    // }

    // {
    //     "message": "Warp bridge deployed successfully",
    //         "contracts": {
    //         "origin": {
    //             "chainName": "holesky",
    //                 "standard": "EvmHypCollateral",
    //                     "decimals": 18,
    //                         "symbol": "ETH",
    //                             "name": "HOLESKY",
    //                                 "addressOrDenom": "0x5Aa86c219fF54878A5fF285e3d75e3F96d9A5B5d",
    //                                     "collateralAddressOrDenom": "0x144d5C8f1C1dBA3A1E359d92C72a485FA3195cB7",
    //                                         "connections": [
    //                                             {
    //                                                 "token": "ethereum|sepolia|0x922dDF01Ef8F3A8056e207503dc2637837A21187"
    //                                             }
    //                                         ]
    //         },
    //         "destination": {
    //             "chainName": "sepolia",
    //                 "standard": "EvmHypSynthetic",
    //                     "decimals": 18,
    //                         "symbol": "ETH",
    //                             "name": "HOLESKY",
    //                                 "addressOrDenom": "0x922dDF01Ef8F3A8056e207503dc2637837A21187",
    //                                     "connections": [
    //                                         {
    //                                             "token": "ethereum|holesky|0x5Aa86c219fF54878A5fF285e3d75e3F96d9A5B5d"
    //                                         }
    //                                     ]
    //         }
    //     },
    //     "config": {
    // "tokens": [
    //     {
    //         "chainName": "holesky",
    //         "standard": "EvmHypCollateral",
    //         "decimals": 18,
    //         "symbol": "ETH",
    //         "name": "HOLESKY",
    //         "addressOrDenom": "0x5Aa86c219fF54878A5fF285e3d75e3F96d9A5B5d",
    //         "collateralAddressOrDenom": "0x144d5C8f1C1dBA3A1E359d92C72a485FA3195cB7",
    //         "connections": [
    //             {
    //                 "token": "ethereum|sepolia|0x922dDF01Ef8F3A8056e207503dc2637837A21187"
    //             }
    //         ]
    //     },
    //     {
    //         "chainName": "sepolia",
    //         "standard": "EvmHypSynthetic",
    //         "decimals": 18,
    //         "symbol": "ETH",
    //         "name": "HOLESKY",
    //         "addressOrDenom": "0x922dDF01Ef8F3A8056e207503dc2637837A21187",
    //         "connections": [
    //             {
    //                 "token": "ethereum|holesky|0x5Aa86c219fF54878A5fF285e3d75e3F96d9A5B5d"
    //             }
    //         ]
    //     }
    // ]
    //     }
    // }
    const destination = "sepolia";
    let recipient = "0x047C6a8E552b52F6993994E3d47e761866cD4Ce9";
    // Wallet: https://holesky.etherscan.io/address/0x047C6a8E552b52F6993994E3d47e761866cD4Ce9
    // const decimals = 18;
    // const amount = BigInt(Math.floor(0.0001 * 10 ** decimals)); // results in Error validating transfer {"amount":"Insufficient balance"}
    // const amount = 0.0001;
    const amountEth = "0.0001"; // Use a string to avoid floating-point errors
    const amount = ethers.utils.parseUnits(amountEth, 18); // Converts to BigInt

    const origin = "holesky";
    // const token = "0x144d5C8f1C1dBA3A1E359d92C72a485FA3195cB7";

    const warpCoreConfig = {
        tokens: [
            {
                chainName: "holesky",
                standard: "EvmHypCollateral",
                decimals: 18,
                symbol: "ETH",
                name: "HOLESKY",
                addressOrDenom: "0x5Aa86c219fF54878A5fF285e3d75e3F96d9A5B5d",
                collateralAddressOrDenom: "0x144d5C8f1C1dBA3A1E359d92C72a485FA3195cB7",
                connections: [
                    {
                        token: "ethereum|sepolia|0x922dDF01Ef8F3A8056e207503dc2637837A21187",
                    },
                ],
            },
            {
                chainName: "sepolia",
                standard: "EvmHypSynthetic",
                decimals: 18,
                symbol: "ETH",
                name: "HOLESKY",
                addressOrDenom: "0x922dDF01Ef8F3A8056e207503dc2637837A21187",
                connections: [
                    {
                        token: "ethereum|holesky|0x5Aa86c219fF54878A5fF285e3d75e3F96d9A5B5d",
                    },
                ],
            },
        ],
    };

    // const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);
    // const wallet = new ethers.Wallet("");
    const wallet = new ethers.Wallet("");
    console.log("Wallet address:", wallet.address);
    const { multiProvider, registry } = await getMultiProvider(wallet);

    // const { warp, symbol, router, amount, recipient, destination } = parameters;
    // const chainAddresses = await registry.getAddresses();

    try {
        const signer = multiProvider.getSigner(origin);
        const recipientSigner = multiProvider.getSigner(destination);

        const recipientAddress = await recipientSigner.getAddress();
        const signerAddress = await signer.getAddress();

        recipient ||= recipientAddress;

        const chainAddresses = await registry.getAddresses();

        const core = HyperlaneCore.fromAddressesMap(chainAddresses, multiProvider);

        const provider = multiProvider.getProvider(origin);
        const connectedSigner = signer.connect(provider);

        const warpCore = WarpCore.FromConfig(MultiProtocolProvider.fromMultiProvider(multiProvider), warpCoreConfig);

        let token: Token;
        const tokensForRoute = warpCore.getTokensForRoute(origin, destination);
        if (tokensForRoute.length === 0) {
            console.log(`No Warp Routes found from ${origin} to ${destination}`);
            throw new Error("Error finding warp route");
        } else if (tokensForRoute.length === 1) {
            token = tokensForRoute[0];
        } else {
            // Expects object not string
            // token = "0x144d5C8f1C1dBA3A1E359d92C72a485FA3195cB7";
            throw new Error("Error finding warp route");
        }
        // else {
        //     console.log(`Please select a token from the Warp config`);
        //     const routerAddress = await runTokenSelectionStep(tokensForRoute);
        //     token = warpCore.findToken(origin, routerAddress)!;
        // }

        console.log(token);

        const errors = await warpCore.validateTransfer({
            originTokenAmount: token.amount(amount),
            destination,
            recipient,
            sender: signerAddress,
        });
        if (errors) {
            console.log(errors);
            console.log("Error validating transfer", JSON.stringify(errors));
            throw new Error("Error validating transfer");
        }

        // TODO: override hook address for self-relay
        const transferTxs = await warpCore.getTransferRemoteTxs({
            originTokenAmount: new TokenAmount(amount, token),
            destination,
            sender: signerAddress,
            recipient,
        });

        const txReceipts = [];
        for (const tx of transferTxs) {
            if (tx.type === ProviderType.EthersV5) {
                const txResponse = await connectedSigner.sendTransaction(tx.transaction);
                const txReceipt = await multiProvider.handleTx(origin, txResponse);
                txReceipts.push(txReceipt);
            }
        }
        const transferTxReceipt = txReceipts[txReceipts.length - 1];
        const messageIndex: number = 0;
        const message: DispatchedMessage = HyperlaneCore.getDispatchedMessages(transferTxReceipt)[messageIndex];

        const parsed = parseWarpRouteMessage(message.parsed.body);

        console.log(
            `Sent transfer from sender (${signerAddress}) on ${origin} to recipient (${recipient}) on ${destination}.`,
        );
        console.log(`Message ID: ${message.id}`);
        // console.log(`Explorer Link: ${EXPLORER_URL}/message/${message.id}`);
        // console.log(`Message:\n${indentYamlOrJson(yamlStringify(message, null, 2), 4)}`);
        // console.log(`Body:\n${indentYamlOrJson(yamlStringify(parsed, null, 2), 4)}`);

        // if (selfRelay) {
        //     const relayer = new HyperlaneRelayer({ core });

        //     const hookAddress = await core.getSenderHookAddress(message);
        //     const merkleAddress = chainAddresses[origin].merkleTreeHook;
        //     stubMerkleTreeConfig(relayer, origin, hookAddress, merkleAddress);

        //     log('Attempting self-relay of transfer...');
        //     await relayer.relayMessage(transferTxReceipt, messageIndex, message);
        //     console.log(WarpSendLogs.SUCCESS);
        //     return;
        // }

        // if (skipWaitForDelivery) return;

        // Max wait 10 minutes
        await core.waitForMessageProcessed(transferTxReceipt, 10000, 60);
        console.log(`Transfer sent to ${destination} chain!`);
    } catch (error) {
        console.error("Error details:", error);
        return JSON.stringify(
            {
                message: "Failed to send message",
                error: error instanceof Error ? error.message : String(error),
                // originChain,
                // destinationChain,
            },
            null,
            2,
        );
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
        const collateralAddressOrDenom = isCollateralTokenConfig(config) ? config.token : undefined;

        const tokenType = config.type as keyof TokenFactories;
        const tokenContract = contract[tokenType];

        assert(tokenContract?.address, "Missing token contract address");

        warpCoreConfig.tokens.push({
            chainName,
            standard: TOKEN_TYPE_TO_STANDARD[config.type],
            decimals,
            symbol,
            name,
            addressOrDenom: tokenContract.address,
            collateralAddressOrDenom,
        });
    }
}

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

sendTestTransfer();

// const provider = new ethers.providers.JsonRpcProvider("https://ethereum-sepolia.rpc.url"); // Replace with your Sepolia RPC URL
// const provider = new ethers.providers.JsonRpcProvider("https://ethereum-holesky.publicnode.com");

// const walletAddress = "0x047C6a8E552b52F6993994E3d47e761866cD4Ce9"; // Replace with your actual wallet address

// const amountEth = "0.0001";  // Keep as a string to avoid floating-point issues
// const amountWei = ethers.utils.parseUnits(amountEth, 18); // Convert ETH to wei (BigNumber in v5)

// async function checkBalance() {
//     const balance = await provider.getBalance(walletAddress);
//     console.log("Wallet Balance in ETH:", ethers.utils.formatEther(balance));

//     if (balance.lt(amountWei)) { // Use .lt() for BigNumber comparison in v5
//         console.error("❌ Insufficient balance! You need at least:", ethers.utils.formatEther(amountWei), "ETH");
//     } else {
//         console.log("✅ Sufficient balance to proceed.");
//     }
// }

// checkBalance();
