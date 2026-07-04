import { EVMTransaction, TransactionLog } from "@goat-sdk/wallet-evm";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { HyperlaneSmartProvider } from "@hyperlane-xyz/sdk";
import { BigNumber, ethers } from "ethers";
import { BlockTag, Chain } from "viem";

export class EVMWalletClientSigner extends ethers.Signer {
    walletClient: EVMWalletClient;
    chain: Chain;
    provider?: HyperlaneSmartProvider = undefined;
    getProviderNetwork?: () => Promise<ethers.providers.Network> = undefined;

    constructor(walletClient: EVMWalletClient, chain: Chain, provider?: HyperlaneSmartProvider) {
        super();
        this.walletClient = walletClient;
        this.chain = chain;
        if (provider) {
            this.provider = provider;
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
        throw new Error("signTransaction not yet implemented on EVMWalletClientSigner");
    }

    async sendTransaction(
        transaction: ethers.providers.TransactionRequest,
    ): Promise<ethers.providers.TransactionResponse> {
        const tx = await this.populateTransaction(transaction);
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
        const providerUrls = (provider as HyperlaneSmartProvider).rpcProviders.map(
            (rpcProvider) => rpcProvider.rpcConfig.http,
        );
        return new EVMWalletClientSigner(
            this.walletClient.cloneWithNewChainAndRpc(this.chain, {
                default: providerUrls[0], // TODO: is 0 good enough?
                // TODO: maybe add ens rpc provider here for SmartWalletClient?
            }),
            this.chain,
            provider as HyperlaneSmartProvider,
        );
    }
}
