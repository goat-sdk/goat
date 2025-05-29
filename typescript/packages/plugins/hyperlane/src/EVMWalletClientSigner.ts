import { EVMTransaction, TransactionLog } from "@goat-sdk/wallet-evm";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { HyperlaneSmartProvider } from "@hyperlane-xyz/sdk";
import { BigNumber, ethers } from "ethers";
import { BlockTag } from "viem";
import * as chains from "viem/chains";

export class EVMWalletClientSigner extends ethers.Signer {
    walletClient: EVMWalletClient;
    provider?: HyperlaneSmartProvider = undefined;
    chainId?: number;
    getProviderNetwork?: () => Promise<ethers.providers.Network> = undefined;

    constructor(walletClient: EVMWalletClient, provider?: HyperlaneSmartProvider) {
        super();
        this.walletClient = walletClient;
        if (provider) {
            this.provider = provider;
            this.getProviderNetwork = this.providerNetworkSingleton();
            this.getProviderNetwork();
        }
    }

    private providerNetworkSingleton() {
        let providerNetwork: ethers.providers.Network | undefined;

        return async (): Promise<ethers.providers.Network> => {
            if (providerNetwork === undefined) {
                providerNetwork = await this.provider?.getNetwork();
                this.chainId = providerNetwork?.chainId;
            }
            return providerNetwork as ethers.providers.Network;
        };
    }

    private getChain(id: number) {
        for (const chain of Object.values(chains)) {
            if (chain.id === id) {
                return chain;
            }
        }
    }

    private typeNumberToString = (transactionType?: number) => {
        const mapping = {
            2: "eip1559",
            1: "eip2930",
            0: "legacy",
        };
        if (transactionType && transactionType in Object.keys(mapping)) {
            return mapping[transactionType as keyof typeof mapping];
        }
    };

    private typeStringToNumber = (transactionType?: string) => {
        const mapping = {
            eip1559: 2,
            eip2930: 1,
            legacy: 0,
        };
        if (transactionType && transactionType in Object.keys(mapping)) {
            return mapping[transactionType as keyof typeof mapping];
        }
    };

    async ethersToEVMTransaction(tx: ethers.providers.TransactionRequest): Promise<EVMTransaction> {
        let gas = undefined;
        if (tx.gasLimit) {
            gas = BigInt(tx.gasLimit.toString());
        } else {
            if (this.provider === undefined) {
                throw new Error("Provider is not set");
            }
            gas = (await this.provider.estimateGas(tx)).toBigInt();
        }
        debugger;
        const chain = this.getChain(this.chainId!);
        return {
            to: tx.to as string,
            value: tx.value ? BigInt(tx.value.toString()) : undefined,
            data: tx.data ? (ethers.utils.hexlify(tx.data) as `0x${string}`) : undefined,
            maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas.toString()) : undefined,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? BigInt(tx.maxPriorityFeePerGas.toString()) : undefined,
            // accessList: tx?.accessList.,
            nonce: tx.nonce ? Number(tx.nonce) : undefined,
            from: tx.from as `0x${string}`,
            // gas: 3000000n,
            gas: gas,
            // gasPrice: tx?.gasPrice,
            chain: {
                // blockExplorers?: {
                //     [key: string]: ChainBlockExplorer;
                //     default: ChainBlockExplorer;
                // } | undefined;
                // contracts?: {
                //     [x: string]: ChainContract | {
                //         [sourceId: number]: ChainContract | undefined;
                //     } | undefined;
                //     ensRegistry?: ChainContract | undefined;
                //     ensUniversalResolver?: ChainContract | undefined;
                //     multicall3?: ChainContract | undefined;
                //     universalSignatureVerifier?: ChainContract | undefined;
                // } | undefined;
                id: chain!.id,
                name: chain!.name,
                nativeCurrency: chain!.nativeCurrency,
                rpcUrls: {
                    default: {
                        http: this.provider!.rpcProviders.map((rpcProvider) => rpcProvider.rpcConfig.http), // Replace with actual RPC URL(s)
                    },
                },
                // sourceId?: number | undefined;
                testnet: chain!.testnet,
            },
            chainId: tx.chainId,
            type: this.typeNumberToString(tx?.type) as "legacy" | "eip2930" | "eip1559" | undefined,
            customData: tx.customData,
            ccipReadEnabled: tx.ccipReadEnabled,
        };
    }

    async getAddress(): Promise<string> {
        return this.walletClient.getAddress();
    }

    async signMessage(message: string): Promise<string> {
        const { signature } = await this.walletClient.signMessage(message);
        return signature;
    }

    async signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
        const evmTransaction = await this.ethersToEVMTransaction(transaction);
        const { signature } = await this.walletClient.signTransaction(evmTransaction);
        return signature;
    }

    async sendTransaction(
        transaction: ethers.providers.TransactionRequest,
    ): Promise<ethers.providers.TransactionResponse> {
        const tx = await this.populateTransaction(transaction);
        if (this.provider) {
            const signedTransaction = await this.signTransaction(tx);
            return await this.provider.sendTransaction(signedTransaction);
        }
        const evmTransaction = await this.ethersToEVMTransaction(tx);
        const transactionResponse = await this.walletClient.sendTransaction({
            ...evmTransaction,
        });
        const sender = await this.getAddress();
        return {
            hash: transactionResponse.hash,
            confirmations: 0,
            from: sender,
            nonce: tx.nonce,
            data: tx.data,
            wait: async (confirmations?: number) => {
                return (await Promise.resolve({
                    byzantium: true,
                    confirmations: confirmations || 0,
                    status: 1,
                    transactionHash: transactionResponse.hash,
                    to: evmTransaction.to,
                    from: sender,
                    contractAddress: transactionResponse.contractAddress,
                    transactionIndex: transactionResponse.transactionIndex,
                    gasUsed: transactionResponse.gasUsed ? BigNumber.from(transactionResponse.gasUsed) : undefined,
                    logsBloom: transactionResponse.logsBloom,
                    blockHash: transactionResponse.blockHash,
                    nonce: tx.nonce,
                    logs: transactionResponse.logs
                        ? transactionResponse.logs.map((log: TransactionLog) => ({
                              ...log,
                              blockNumber: Number(log.blockNumber),
                          }))
                        : [],
                    blockNumber: Number(transactionResponse.blockNumber),
                    cumulativeGasUsed: transactionResponse.cumulativeGasUsed
                        ? BigNumber.from(transactionResponse.cumulativeGasUsed)
                        : undefined,
                    effectiveGasPrice: transactionResponse.effectiveGasPrice
                        ? BigNumber.from(transactionResponse.effectiveGasPrice)
                        : undefined,
                    type: this.typeStringToNumber(transactionResponse.type),
                })) as ethers.providers.TransactionReceipt;
            },
        } as ethers.providers.TransactionResponse;
    }

    async call(transaction: ethers.providers.TransactionRequest, blockTag?: BlockTag): Promise<string> {
        if (!this.provider) {
            throw new Error("Provider is not set");
        }
        const response = await this.provider?.call(transaction);
        return response as string;
    }

    connect(provider: ethers.providers.Provider): ethers.Signer {
        return new EVMWalletClientSigner(this.walletClient, provider as HyperlaneSmartProvider);
    }
}
