/**
 * @fileoverview Tools for interacting with the DeBridge protocol
 * Provides functionality for cross-chain token bridging and swaps
 */

import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { DebridgeOptions } from "./index";
import {
    createBridgeOrderParametersSchema,
    executeBridgeTransactionParametersSchema,
    getBridgeQuoteParametersSchema,
    getTokenInfoParametersSchema,
} from "./parameters";
import { DEBRIDGE_ABI } from "./abi/debridge";
import { decodeFunctionData } from 'viem';

/** Default referral code for DeBridge transactions */
const REFERRAL_CODE = "21064";

/**
 * Core tools for interacting with the DeBridge protocol
 * Provides methods for getting quotes, creating orders, and executing bridge transactions
 */
export class DebridgeTools {
    constructor(private options: DebridgeOptions) {}

    /** Solana's native token (SOL) address in base58 format */
    private static readonly SOLANA_NATIVE_TOKEN = "11111111111111111111111111111111";

    /** EVM native token (ETH/BNB/etc) address */
    private static readonly EVM_NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

    /**
     * Get a quote for bridging tokens between chains
     * This method provides an estimate of the token amounts and fees for a cross-chain transfer
     *
     * @param {EVMWalletClient} walletClient - The wallet client for transaction signing
     * @param {getBridgeQuoteParametersSchema} parameters - Parameters for the bridge quote
     * @returns {Promise<Object>} Quote information including estimated amounts and fees
     * @throws {Error} If the API request fails or returns an error
     *
     * @example
     * ```typescript
     * const quote = await debridgeTools.getBridgeQuote(wallet, {
     *   srcChainId: "1",
     *   srcChainTokenIn: "0x0000000000000000000000000000000000000000",
     *   srcChainTokenInAmount: "1000000000000000000",
     *   dstChainId: "7565164",
     *   dstChainTokenOut: "DBRiDgJAMsM95moTzJs7M9LnkGErpbv9v6CUR1DXnUu5"
     * });
     * ```
     */
    @Tool({
        name: "get_bridge_quote",
        description:
            "Get a quote for bridging tokens between chains. Use get_token_info first to get correct token addresses.",
    })
    async getBridgeQuote(walletClient: EVMWalletClient, parameters: getBridgeQuoteParametersSchema) {
        try {
            const isSameChain = parameters.srcChainId === parameters.dstChainId;
            const userAddress = await walletClient.getAddress();

            const url = isSameChain
                ? `${this.options.baseUrl}/chain/transaction?${new URLSearchParams({
                      chainId: parameters.srcChainId,
                      tokenIn: parameters.srcChainTokenIn,
                      tokenInAmount: parameters.srcChainTokenInAmount,
                      tokenOut: parameters.dstChainTokenOut,
                      tokenOutRecipient: userAddress,
                      slippage: parameters.slippage?.toString() || "auto",
                      affiliateFeePercent: "0",
                  })}`
                : `${this.options.baseUrl}/dln/order/create-tx?${new URLSearchParams({
                      srcChainId: parameters.srcChainId,
                      srcChainTokenIn: parameters.srcChainTokenIn,
                      srcChainTokenInAmount: parameters.srcChainTokenInAmount,
                      dstChainId: parameters.dstChainId,
                      dstChainTokenOut: parameters.dstChainTokenOut,
                      dstChainTokenOutAmount: "auto",
                      prependOperatingExpenses: parameters.prependOperatingExpenses?.toString() || "true",
                      additionalTakerRewardBps: "0",
                  })}`;

            console.log("Making request to:", url);

            const response = await fetch(url);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }

            const data = await response.json();
            console.log("Bridge quote response:", JSON.stringify(data, null, 2));
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            throw new Error(`Failed to get bridge quote: ${error}`);
        }
    }

    /**
     * Create a bridge order to transfer tokens between chains
     * This method initiates the cross-chain transfer by creating an order on DeBridge
     *
     * @param {EVMWalletClient} walletClient - The wallet client for transaction signing
     * @param {createBridgeOrderParametersSchema} parameters - Parameters for creating the bridge order
     * @returns {Promise<Object>} Order details including transaction data and fees
     * @throws {Error} If the API request fails or returns an error
     *
     * @example
     * ```typescript
     * const order = await debridgeTools.createBridgeOrder(wallet, {
     *   srcChainTokenIn: "0x0000000000000000000000000000000000000000",
     *   srcChainTokenInAmount: "1000000000000000000",
     *   // ... other parameters
     * });
     * ```
     */
    @Tool({
        name: "create_bridge_order",
        description: `Create a bridge order to transfer tokens between chains.

EVM to EVM:
1. Use EVM addresses (0x...) for all fields
2. Set dstChainTokenOutRecipient to recipient's EVM address
3. Set senderAddress, srcChainOrderAuthorityAddress, srcChainRefundAddress to user's EVM address

To Solana (7565164):
1. Ask for Solana recipient address (base58, e.g. DXu6uARB7gVxqtuwjMyK2mgEchorxDDyrSN9dRK1Af7q)
2. Set dstChainTokenOutRecipient, dstChainOrderAuthorityAddress to Solana address
3. Set senderAddress, srcChainOrderAuthorityAddress, srcChainRefundAddress to EVM address

From Solana:
1. Ask for EVM address (0x...)
2. Set dstChainTokenOutRecipient to EVM address
3. Set senderAddress, srcChainOrderAuthorityAddress, srcChainRefundAddress to Solana address`,
    })
    async createBridgeOrder(walletClient: EVMWalletClient, parameters: createBridgeOrderParametersSchema) {
        try {
            const params = new URLSearchParams();
            params.append("srcChainId", parameters.srcChainId);
            params.append("srcChainTokenIn", parameters.srcChainTokenIn);
            params.append("srcChainTokenInAmount", parameters.srcChainTokenInAmount);
            params.append("dstChainId", parameters.dstChainId);
            params.append("dstChainTokenOut", parameters.dstChainTokenOut);
            params.append("dstChainTokenOutRecipient", parameters.dstChainTokenOutRecipient);
            params.append("senderAddress", parameters.senderAddress);
            // If srcChainOrderAuthorityAddress is not provided, use senderAddress
            params.append("srcChainOrderAuthorityAddress", parameters.srcChainOrderAuthorityAddress || parameters.senderAddress);
            params.append("srcChainRefundAddress", parameters.srcChainRefundAddress);
            // If dstChainOrderAuthorityAddress is not provided, use dstChainTokenOutRecipient
            params.append("dstChainOrderAuthorityAddress", parameters.dstChainOrderAuthorityAddress || parameters.dstChainTokenOutRecipient);
            params.append("referralCode", parameters.referralCode || REFERRAL_CODE || "21064");
            params.append("prependOperatingExpenses", "true");
            params.append("enableEstimate", parameters.enableEstimate?.toString() || "false");
            params.append("ptp", parameters.ptp?.toString() || "false");
            // if (parameters.allowedTaker) {
            //     params.append('allowedTaker', parameters.allowedTaker);
            // }

            const url = `${this.options.baseUrl}/dln/order/create-tx?${params}`;

            console.log("Making create bridge order request to:", url);

            const response = await fetch(url);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Format the txData to ensure it's properly stringified
            if (data.tx?.data) {
                data.tx.data = data.tx.data.toString();
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to create bridge order: ${error}`);
        }
    }

    /**
     * Get token information from a chain
     *
     * @param {EVMWalletClient} walletClient - The wallet client
     * @param {getTokenInfoParametersSchema} parameters - Parameters for token info query
     * @returns {Promise<TokenInfoResponse>} Token information including address, symbol, name, and decimals
     * @throws {Error} If the API request fails or returns an error
     *
     * @example
     * ```typescript
     * // Get all tokens on Solana
     * const { tokens } = await debridgeTools.getTokenInfo(wallet, {
     *   chainId: "7565164"
     * });
     *
     * // Get specific token info
     * const { tokens } = await debridgeTools.getTokenInfo(wallet, {
     *   chainId: "7565164",
     *   tokenAddress: "DBRiDgJAMsM95moTzJs7M9LnkGErpbv9v6CUR1DXnUu5"
     * });
     * ```
     */
    @Tool({
        name: "get_token_info",
        description:
            "Get token information from a chain. For EVM: use 0x-prefixed address. For Solana: use base58 token address.",
    })
    async getTokenInfo(walletClient: EVMWalletClient, parameters: getTokenInfoParametersSchema) {
        try {
            const url = `${this.options.baseUrl}/token-list?chainId=${parameters.chainId}`;

            console.log("Fetching token information from:", url);

            const response = await fetch(url);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }

            const responseData = await response.json();
            const data = responseData.tokens;

            // Define token data type
            type TokenData = {
                name: string;
                symbol: string;
                decimals: number;
            };

            // If a specific token address is provided, return just that token's info
            if (parameters.tokenAddress) {
                const tokenInfo = data[parameters.tokenAddress];
                if (!tokenInfo) {
                    throw new Error(`Token ${parameters.tokenAddress} not found on chain ${parameters.chainId}`);
                }
                return {
                    name: tokenInfo.name,
                    symbol: tokenInfo.symbol,
                    address: parameters.tokenAddress,
                    decimals: tokenInfo.decimals,
                };
            }

            // Filter tokens by search term
            const searchTerm = parameters.search?.toLowerCase() || "";
            const tokens = Object.entries(data as Record<string, TokenData>)
                .filter(
                    ([, token]: [string, TokenData]) =>
                        token.symbol && (!searchTerm || token.symbol.toLowerCase().includes(searchTerm)),
                )
                .reduce(
                    (acc, [address, token]: [string, TokenData]) => {
                        acc[address] = {
                            name: token.name,
                            symbol: token.symbol,
                            address: address, // Use the full address from the key
                            decimals: token.decimals,
                        };
                        return acc;
                    },
                    {} as Record<
                        string,
                        {
                            name: string;
                            symbol: string;
                            address: string;
                            decimals: number;
                        }
                    >,
                );

            // Log matched tokens with full addresses
            const matchedTokens = Object.values(tokens);
            if (searchTerm && matchedTokens.length > 0) {
                console.log(
                    `Found ${matchedTokens.length} token(s) matching symbol "${searchTerm}":`,
                    JSON.stringify(matchedTokens, null, 2),
                );
            }

            return { tokens };
        } catch (error) {
            console.error("Error fetching token information:", error);
            throw error;
        }
    }

    /**
     * Execute a bridge transaction with the provided transaction data
     * This method signs and sends the transaction to the blockchain
     *
     * @param {EVMWalletClient} walletClient - The wallet client for transaction signing
     * @param {executeBridgeTransactionParametersSchema} parameters - Parameters for executing the bridge transaction
     * @returns {Promise<Object>} Transaction hash and other details
     * @throws {Error} If the transaction fails or returns an error
     *
     * @example
     * ```typescript
     * // Execute transaction using order's tx data
     * const result = await debridgeTools.executeBridgeTransaction(wallet, {
     *   txData: order.tx
     * });
     * ```
     */
    @Tool({
        name: "execute_bridge_transaction",
        description: "Execute a bridge transaction using tx data from create_bridge_order tool",
    })
    async executeBridgeTransaction(
        walletClient: EVMWalletClient,
        parameters: executeBridgeTransactionParametersSchema,
    ) {
        try {
            const { txData } = parameters;
            
            // Validate transaction data
            if (!txData.to || !txData.data) {
                throw new Error("Invalid transaction data: missing 'to' or 'data' field");
            }
            
            // Validate data format
            if (!txData.data.startsWith('0x')) {
                throw new Error("Invalid transaction data: 'data' field must start with '0x'");
            }

            // Enhanced logging for debugging
            console.log("Executing bridge transaction with data:", {
                to: txData.to,
                value: txData.value ? `${txData.value} (${BigInt(txData.value)})` : 'undefined',
                data: {
                    full: txData.data,
                    functionSelector: txData.data.slice(0, 10),
                    parameters: txData.data.slice(10)
                }
            });

            // Send transaction using raw transaction data
            console.log("Sending transaction...");
            const sendRes = await walletClient.sendTransaction({
                to: txData.to as `0x${string}`,
                data: txData.data as `0x${string}`,
                value: txData.value ? BigInt(txData.value) : undefined,
            });

            console.log("Transaction sent! Hash:", sendRes.hash);
            return { hash: sendRes.hash };

        } catch (error) {
            console.error("Bridge transaction execution failed:", error);
            throw new Error(`Failed to execute bridge transaction: ${error}`);
        }
    }
}
