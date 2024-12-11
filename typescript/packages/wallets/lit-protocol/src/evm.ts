import type {
    EVMReadRequest,
    EVMReadResult,
    EVMTransaction,
    EVMTransactionResult,
    EVMTypedData,
    EVMWalletClient,
    Signature,
} from "@goat-sdk/core";
import { api, EthereumLitTransaction } from "@lit-protocol/wrapped-keys";
import type { AccsDefaultParams } from "@lit-protocol/types";
import { mainnet } from "viem/chains";
import { isAddress, formatEther, publicActions } from "viem";
import { normalize } from "viem/ens";

import { signEip712MessageLitActionCode } from "./litActions/evmWrappedKeySignEip712Message";
import type { LitEVMWalletOptions } from "./types";

const { signMessageWithEncryptedKey, signTransactionWithEncryptedKey } = api;

export function createEVMWallet(options: LitEVMWalletOptions): EVMWalletClient {
    const { litNodeClient, pkpSessionSigs, wrappedKeyMetadata, chainId, litEVMChainIdentifier, viemWalletClient } = options;

    const viemPublicClient = viemWalletClient.extend(publicActions);

    function getPkpAccessControlCondition(
        pkpAddress: string
    ): AccsDefaultParams {
        if (!isAddress(pkpAddress)) {
            throw new Error(
                `pkpAddress is not a valid Ethereum Address: ${pkpAddress}`
            );
        }

        return {
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "",
            parameters: [":userAddress"],
            returnValueTest: {
                comparator: "=",
                value: pkpAddress,
            },
        };
    }

    async function resolveAddress(address: string) {
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) return address as `0x${string}`;

        try {
            const resolvedAddress = (await viemPublicClient.getEnsAddress({
                name: normalize(address),
            })) as `0x${string}`;
            if (!resolvedAddress) {
                throw new Error("ENS name could not be resolved.");
            }
            return resolvedAddress as `0x${string}`;
        } catch (error) {
            throw new Error(`Failed to resolve ENS name: ${error}`);
        }
    }

    const waitForReceipt = async (hash: `0x${string}`) => {
        const receipt = await viemPublicClient.waitForTransactionReceipt({ hash });
        return { hash: receipt.transactionHash, status: receipt.status };
    };

    return {
        getAddress: () => wrappedKeyMetadata.wrappedKeyAddress,
        getChain() {
            return {
                type: "evm",
                id: options.chainId ?? 0,
            };
        },
        resolveAddress,
        async signMessage(message: string): Promise<Signature> {
            return {
                signature: await signMessageWithEncryptedKey({
                    pkpSessionSigs,
                    network: "evm",
                    id: wrappedKeyMetadata.id,
                    messageToSign: message,
                    litNodeClient,
                })
            }
        },
        async signTypedData(data: EVMTypedData): Promise<Signature> {
            const response = await litNodeClient.executeJs({
                sessionSigs: pkpSessionSigs,
                code: signEip712MessageLitActionCode,
                jsParams: {
                    accessControlConditions: [
                        getPkpAccessControlCondition(wrappedKeyMetadata.pkpAddress),
                    ],
                    ciphertext: wrappedKeyMetadata.ciphertext,
                    dataToEncryptHash: wrappedKeyMetadata.dataToEncryptHash,
                    messageToSign: JSON.stringify(data),
                },
            });

            return {
                signature: response.response as string,
            };
        },
        async sendTransaction(transaction: EVMTransaction): Promise<EVMTransactionResult> {
            const { to, abi, functionName, args, value } = transaction;
            const toAddress = await resolveAddress(to);

            // Simple ETH transfer (no ABI)
            if (!abi) {
                const litTransaction: EthereumLitTransaction = {
                    chainId,
                    chain: litEVMChainIdentifier,
                    toAddress,
                    value: formatEther(value ?? 0n),
                }
                
                const txHash = await signTransactionWithEncryptedKey({
                    litNodeClient,
                    pkpSessionSigs,
                    network: "evm",
                    id: wrappedKeyMetadata.id,
                    unsignedTransaction: litTransaction,
                    broadcast: true,
                });
                return waitForReceipt(txHash as `0x${string}`);
            }

            // Contract call
            if (!functionName) {
                throw new Error("Function name is required for contract calls");
            }
            
            const { request } = await viemPublicClient.simulateContract({
                account: wrappedKeyMetadata.wrappedKeyAddress as `0x${string}`,
                address: toAddress as `0x${string}`,
                abi,
                functionName,
                args,
                chain: viemWalletClient.chain,
            });

            // Without paymaster, use writeContract which handles encoding too,
            // but since we already have request, let's let writeContract do its thing.
            // However, writeContract expects the original request format (with abi, functionName, args).
            const txHash = await viemWalletClient.writeContract(request);
            return waitForReceipt(txHash);
        },
        async read(request: EVMReadRequest): Promise<EVMReadResult> {
            const { address, abi, functionName, args } = request;
            if (!abi) throw new Error("Read request must include ABI for EVM");

            const result = await viemPublicClient.readContract({
                address: await this.resolveAddress(address),
                abi,
                functionName,
                args,
            });

            return { value: result };
        },
        async balanceOf(address: string) {
            const resolvedAddress = await this.resolveAddress(address);
            const balance = await viemPublicClient.getBalance({
                address: resolvedAddress,
            });

            const chain = viemWalletClient.chain ?? mainnet;

            return {
                value: balance,
                decimals: chain.nativeCurrency.decimals,
                symbol: chain.nativeCurrency.symbol,
                name: chain.nativeCurrency.name,
            };
        },
    };
} 