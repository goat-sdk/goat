import { EVMTransaction, TransactionLog } from "@goat-sdk/wallet-evm";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BigNumber, ethers } from "ethers";
import { AccessList, BlockTag } from "viem";

export class EVMWalletClientSigner extends ethers.Signer {
    walletClient: EVMWalletClient;
    provider?: ethers.providers.Provider = undefined;
    providerChainId?: number = undefined

    constructor(walletClient: EVMWalletClient, provider?: ethers.providers.Provider) {
        super();
        this.walletClient = walletClient;
        if (provider) {
            this.provider = provider;
            this.providerChainId = await provider.getNetwork().chainId;
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
            accessList: tx.accessList ? (tx.accessList as AccessList) : undefined,
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
        const evmTransaction = await this.ethersToEVMTransaction(transaction);
        const { signature } = await this.walletClient.signTransaction(evmTransaction);
        return signature;
    }

    async sendTransaction(
        transaction: ethers.providers.TransactionRequest,
    ): Promise<ethers.providers.TransactionResponse> {
        const walletChainId = this.walletClient.getChain().id;
        const shouldSwitchChain = this.providerChainId !== walletChainId;
        if (this.providerChainId && shouldSwitchChain) {
            await this.walletClient.switchChain(this.providerChainId);
        }
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
        if (shouldSwitchChain) {
            await this.walletClient.switchChain(walletChainId);
        }
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
        return new EVMWalletClientSigner(this.walletClient, provider);
    }
}
