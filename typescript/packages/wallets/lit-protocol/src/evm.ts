import type {
    EVMReadRequest,
    EVMReadResult,
    EVMTransaction,
    EVMTransactionResult,
    EVMTypedData,
    EVMWalletClient,
    LitEVMWalletOptions,
    Signature,
} from "@goat-sdk/core";
import { api } from "@lit-protocol/wrapped-keys";
import { ethers } from "ethers";
import { signEip712MessageLitActionCode } from "./litActions/evmWrappedKeySignEip712Message";
import type { AccsDefaultParams } from "@lit-protocol/types";

const { getEncryptedKey, signMessageWithEncryptedKey } = api;

export async function createEVMWallet(options: LitEVMWalletOptions): Promise<EVMWalletClient> {
    const { litNodeClient, pkpSessionSigs, wrappedKeyId } = options;

    // {
    //     ciphertext: string;
    //     dataToEncryptHash: string;
    //     id: string;
    //     keyType: KeyType;
    //     litNetwork: LIT_NETWORKS_KEYS;
    //     memo: string;
    //     pkpAddress: string;
    //     publicKey: string;
    // }
    const WRAPPED_KEY_METADATA = await getEncryptedKey({
        litNodeClient,
        pkpSessionSigs,
        id:wrappedKeyId,
    });
    const WRAPPED_KEY_ETH_ADDRESS = ethers.utils.computeAddress(WRAPPED_KEY_METADATA.publicKey);
    
    const waitForReceipt = async (hash: string): Promise<EVMTransactionResult> => {
        // TODO: Implement waiting for transaction receipt
        throw new Error("Not implemented");
    };

    function getPkpAccessControlCondition(
        pkpAddress: string
    ): AccsDefaultParams {
        if (!ethers.utils.isAddress(pkpAddress)) {
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

    return {
        getAddress: () => WRAPPED_KEY_ETH_ADDRESS,
        getChain: () => ({
            type: "evm",
            id: options.chainId ?? 0,
        }),
        async resolveAddress(address: string): Promise<`0x${string}`> {
            if (/^0x[a-fA-F0-9]{40}$/.test(address)) return address as `0x${string}`;

            try {
                /**
                 * @todo: This will always fail because it will use the Lit Chronicle Yellowstone provider, and not an Ethereum provider
                 */
                const resolvedAddress = await ethers.providers.getDefaultProvider().resolveName(address);
                if (!resolvedAddress) {
                    throw new Error("ENS name could not be resolved.");
                }
                return resolvedAddress as `0x${string}`;
            } catch (error) {
                throw new Error(`Failed to resolve ENS name: ${error}`);
            }
        },
        async signMessage(message: string): Promise<Signature> {
            return {
                signature: await signMessageWithEncryptedKey({
                    pkpSessionSigs,
                    network: "evm",
                    id: wrappedKeyId,
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
                        getPkpAccessControlCondition(WRAPPED_KEY_METADATA.pkpAddress),
                    ],
                    ciphertext: WRAPPED_KEY_METADATA.ciphertext,
                    dataToEncryptHash: WRAPPED_KEY_METADATA.dataToEncryptHash,
                    messageToSign: JSON.stringify(data),
                },
            });

            return {
                signature: response.response as string,
            };
        },
        async sendTransaction(transaction: EVMTransaction): Promise<EVMTransactionResult> {
            // TODO
            throw new Error("Not implemented");

            // const { to, abi, functionName, args, value } = transaction;

            // // Simple ETH transfer (no ABI)
            // if (!abi) {
            //     const unsignedTx = {
            //         to,
            //         value: value?.toString(),
            //     };

            //     // Sign and send the transaction using Lit Action
            //     const txHash = await litNodeClient.signTransactionWithEncryptedKey({
            //         pkpSessionSigs,
            //         litNodeClient,
            //         network: "evm",
            //         id: wrappedKeyId,
            //         broadcast: true,
            //         unsignedTransaction: unsignedTx,
            //     });

            //     return waitForReceipt(txHash);
            // }

            // // Contract call
            // if (!functionName) {
            //     throw new Error("Function name is required for contract calls");
            // }

            // // TODO: Encode function data
            // const data = "0x"; // This should be properly encoded based on abi, functionName, and args

            // const unsignedTx = {
            //     to,
            //     value: value?.toString(),
            //     data,
            // };

            // // Sign and send the transaction using Lit Action
            // const txHash = await litNodeClient.signTransactionWithEncryptedKey({
            //     pkpSessionSigs,
            //     litNodeClient,
            //     network: "evm",
            //     id: wrappedKeyId,
            //     broadcast: true,
            //     unsignedTransaction: unsignedTx,
            // });

            // return waitForReceipt(txHash);
        },
        async read(request: EVMReadRequest): Promise<EVMReadResult> {
            // TODO: Implement EVM read using provider
            throw new Error("Not implemented");
        },
        async balanceOf(address: string) {
            // TODO: Implement balance check using provider
            throw new Error("Not implemented");
        },
    };
} 