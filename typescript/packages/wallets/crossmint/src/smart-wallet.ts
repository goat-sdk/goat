import type { EVMReadRequest, EVMSmartWalletClient, EVMTransaction, EVMTypedData } from "@goat-sdk/core";

import type { Abi } from "abitype";
import { http, createPublicClient, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { createCrossmintAPI } from "./api";
import { type SupportedSmartWalletChains, getEnv, getViemChain } from "./chains";

export type CustodialSigner = `0x${string}`;

export type KeyPairSigner = {
    secretKey: `0x${string}`;
};

type EmailLinkedUser = {
    email: string;
};

type PhoneLinkedUser = {
    phone: string;
};

type UserIdLinkedUser = {
    userId: number;
};

export type SmartWalletOptions = {
    signer: CustodialSigner | KeyPairSigner;
    address?: string;
    linkedUser?: EmailLinkedUser | PhoneLinkedUser | UserIdLinkedUser;
    chain: SupportedSmartWalletChains;
    provider: string;
    options?: {
        ensProvider?: string;
    };
};

export function smartWalletFactory(apiKey: string) {
    return async function smartwallet(params: SmartWalletOptions): Promise<EVMSmartWalletClient> {
        const { signer, linkedUser, chain, provider, address: providedAddress } = params;

        const hasCustodialSigner = typeof signer === "string";
        const getLocator = () => {
            if (linkedUser) {
                if ("email" in linkedUser) {
                    return `email:${linkedUser.email}:evm-smart-wallet`;
                }
                if ("phone" in linkedUser) {
                    return `phone:${linkedUser.phone}:evm-smart-wallet`;
                }
                if ("userId" in linkedUser) {
                    return `userId:${linkedUser.userId}:evm-smart-wallet`;
                }
            }

            if (!providedAddress) {
                throw new Error("Smart Wallet address is required if no linked user is provided");
            }

            return providedAddress;
        };

        const locator = getLocator();
        const client = createCrossmintAPI(apiKey, getEnv(chain));
        const { address } = await client.getWallet(locator);

        const viemClient = createPublicClient({
            chain: getViemChain(chain),
            transport: http(provider),
        });

        const signerAccount = hasCustodialSigner ? null : privateKeyToAccount(signer.secretKey);

        const ensClient = createPublicClient({
            chain: mainnet,
            transport: http(params?.options?.ensProvider ?? ""),
        });

        const resolveAddressImpl = async (address: string) => {
            console.log("Address", address);
            if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
                return address as `0x${string}`;
            }

            if (!ensClient) {
                throw new Error("ENS provider is not configured.");
            }

            try {
                const resolvedAddress = (await ensClient.getEnsAddress({
                    name: normalize(address),
                })) as `0x${string}`;
                if (!resolvedAddress) {
                    throw new Error("ENS name could not be resolved.");
                }
                return resolvedAddress as `0x${string}`;
            } catch (error) {
                throw new Error(`Failed to resolve ENS name: ${error}`);
            }
        };

        const sendBatchOfTransactions = async (transactions: EVMTransaction[]) => {
            const transactionDatas = transactions.map((transaction) => {
                const { to: recipientAddress, abi, functionName, args, value } = transaction;

                return buildTransactionData({
                    recipientAddress,
                    abi,
                    functionName,
                    args,
                    value,
                });
            });

            const transactionResponse = await client.createTransactionForSmartWallet(
                address,
                transactionDatas,
                chain,
                signerAccount?.address,
            );

            if (!hasCustodialSigner) {
                const account = privateKeyToAccount(signer.secretKey);
                const userOpHash = transactionResponse.approvals?.pending[0].message;

                if (!userOpHash) {
                    throw new Error("User operation hash is not available");
                }
                const signature = await account.signMessage({
                    message: { raw: userOpHash as `0x${string}` },
                });

                await client.approveTransaction(locator, transactionResponse.id, [
                    {
                        signature,
                        signer: `evm-keypair:${signerAccount?.address}`,
                    },
                ]);
            }

            while (true) {
                const latestTransaction = await client.checkTransactionStatus(locator, transactionResponse.id);

                if (latestTransaction.status === "success" || latestTransaction.status === "failed") {
                    return {
                        hash: latestTransaction.onChain?.txId ?? "",
                        status: latestTransaction.status,
                    };
                }

                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
        };

        return {
            getAddress() {
                return address;
            },
            getChain() {
                return {
                    type: "evm",
                    id: viemClient.chain?.id ?? 0,
                };
            },
            resolveAddress: resolveAddressImpl,
            async signMessage(message: string) {
                const { id: signatureId, approvals } = await client.signMessageForSmartWallet(
                    address,
                    message,
                    chain,
                    signerAccount?.address,
                );

                if (!hasCustodialSigner) {
                    const account = privateKeyToAccount(signer.secretKey);
                    const toSign = approvals?.pending[0].message;
                    const signature = await account.signMessage({
                        message: { raw: toSign as `0x${string}` },
                    });

                    await client.approveSignatureForSmartWallet(
                        signatureId,
                        address,
                        `evm-keypair:${signerAccount?.address}`,
                        signature,
                    );
                }

                while (true) {
                    const latestSignature = await client.checkSignatureStatus(signatureId, address);

                    if (latestSignature.status === "success") {
                        if (!latestSignature.outputSignature) {
                            throw new Error("Signature is undefined");
                        }

                        return {
                            signature: latestSignature.outputSignature,
                        };
                    }

                    if (latestSignature.status === "failed") {
                        throw new Error("Signature failed");
                    }

                    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
                }
            },
            async signTypedData(data: EVMTypedData) {
                const { id: signatureId, approvals } = await client.signTypedDataForSmartWallet(
                    address,
                    data,
                    chain,
                    signerAccount?.address,
                );

                if (!hasCustodialSigner) {
                    const account = privateKeyToAccount(signer.secretKey);
                    const toSign = approvals?.pending[0].message;
                    const signature = await account.signMessage({
                        message: { raw: toSign as `0x${string}` },
                    });

                    await client.approveSignatureForSmartWallet(
                        signatureId,
                        address,
                        `evm-keypair:${signerAccount?.address}`,
                        signature,
                    );
                }

                while (true) {
                    const latestSignature = await client.checkSignatureStatus(signatureId, address);

                    if (latestSignature.status === "success") {
                        if (!latestSignature.outputSignature) {
                            throw new Error("Signature is undefined");
                        }

                        return {
                            signature: latestSignature.outputSignature,
                        };
                    }

                    if (latestSignature.status === "failed") {
                        throw new Error("Signature failed");
                    }

                    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
                }
            },
            async sendTransaction(transaction: EVMTransaction) {
                return await sendBatchOfTransactions([transaction]);
            },
            async sendBatchOfTransactions(transactions: EVMTransaction[]) {
                return await sendBatchOfTransactions(transactions);
            },
            async read(request: EVMReadRequest) {
                const { address: contractAddress, abi, functionName, args } = request;

                const resolvedContractAddress = await resolveAddressImpl(contractAddress);

                if (!abi) throw new Error("Read request must include ABI for EVM");

                const result = await viemClient.readContract({
                    address: resolvedContractAddress,
                    abi,
                    functionName,
                    args,
                });

                return {
                    value: result,
                };
            },
            async balanceOf(address: string) {
                const resolvedAddress = await resolveAddressImpl(address);
                const balance = await viemClient.getBalance({
                    address: resolvedAddress,
                });

                return {
                    decimals: 18,
                    symbol: "ETH",
                    name: "Ethereum",
                    value: balance,
                };
            },
        };
    };
}

function buildTransactionData({
    recipientAddress,
    abi,
    functionName,
    args,
    value,
}: {
    recipientAddress: string;
    abi?: Abi;
    functionName?: string;
    args?: unknown[];
    value?: bigint;
}) {
    if (!abi) {
        return {
            to: recipientAddress,
            value: value?.toString() ?? "0",
            data: "0x",
        };
    }

    if (!functionName) {
        throw new Error("Function name is required");
    }

    return {
        to: recipientAddress,
        value: value?.toString() ?? "0",
        data: encodeFunctionData({ abi, functionName, args }),
    };
}
