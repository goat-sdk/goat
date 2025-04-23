import { type EVMReadRequest, type EVMTransaction, type EVMTypedData, EVMWalletClient } from "@goat-sdk/wallet-evm";
import {
    CallReturnType,
    type WalletClient as ViemWalletClient,
    encodeFunctionData,
    formatUnits,
    publicActions,
} from "viem";
import { mainnet } from "viem/chains";
import { eip712WalletActions, getGeneralPaymasterInput } from "viem/zksync";

export type ViemOptions = {
    paymaster?: {
        defaultAddress: `0x${string}`;
        defaultInput?: `0x${string}`;
    };
};

export class ViemEVMWalletClient extends EVMWalletClient {
    #client: ViemWalletClient;
    #defaultPaymaster: `0x${string}`;
    #defaultPaymasterInput: `0x${string}`;

    private get publicClient() {
        return this.#client.extend(publicActions);
    }

    constructor(client: ViemWalletClient, options?: ViemOptions) {
        super();
        this.#client = client;
        this.#defaultPaymaster = options?.paymaster?.defaultAddress ?? ("" as `0x${string}`);
        this.#defaultPaymasterInput =
            options?.paymaster?.defaultInput ??
            getGeneralPaymasterInput({
                innerInput: "0x",
            });
    }

    async estimateGas(transaction: EVMTransaction) {
        try {
            return await this.publicClient.estimateGas({
                account: this.#client.account,
                to: transaction.to as `0x${string}`,
                value: transaction.value ? BigInt(transaction.value.toString()) : undefined,
                data: transaction?.data,
                maxFeePerGas: transaction?.maxFeePerGas,
                maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas,
            });
        } catch (error) {
            throw new Error(
                `Failed to estimate gas for transaction: ${JSON.stringify(transaction)}
                
                Error: ${error}`
            );
        }
    }

    async call(transaction: EVMTransaction): Promise<CallReturnType> {
        try {
            return await this.publicClient.call({
                account: this.#client.account,
                to: transaction.to as `0x${string}`,
                value: transaction.value ? BigInt(transaction.value.toString()) : undefined,
                data: transaction?.data,
                maxFeePerGas: transaction?.maxFeePerGas,
                maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas,
                accessList: transaction?.accessList,
                nonce: transaction?.nonce,
                gas: transaction?.gas,
            });
        } catch (error) {
            throw new Error(
                `Failed to call transaction: ${JSON.stringify(transaction)}

                Error: ${error}`
            );
        }
    }

    async getTransactionCount() {
        try {
            return await this.publicClient.getTransactionCount({
                address: this.#client.account?.address as `0x${string}`,
            });
        } catch (error) {
            throw new Error(
                `Failed to get transaction count for address: ${this.getAddress()}

                Error: ${error}`
            );
        }
    }

    getAddress() {
        return this.#client.account?.address ?? "";
    }

    getChain() {
        return {
            type: "evm" as const,
            id: this.#client.chain?.id ?? 0,
        };
    }

    async signMessage(message: string) {
        if (!this.#client.account) throw new Error("No account connected");
        try {
            const signature = await this.#client.signMessage({
                message,
                account: this.#client.account,
            });

            return { signature };
        } catch (error) {
            throw new Error(
                `Failed to sign message: ${message}.

                Error: ${JSON.stringify(error)}`
            );
        }
    }

    async signTypedData(data: EVMTypedData) {
        if (!this.#client.account) throw new Error("No account connected");

        try {
            const signature = await this.#client.signTypedData({
                domain: {
                    ...data.domain,
                    chainId: typeof data.domain.chainId === "bigint" ? Number(data.domain.chainId) : data.domain.chainId,
                },
                types: data.types,
                primaryType: data.primaryType,
                message: data.message,
                account: this.#client.account,
            });

            return { signature };
        } catch (error) {
            throw new Error(
                `Failed to sign typed data: ${JSON.stringify(data)}.

                Error: ${error}`
            );
        }
    }

    async signTransaction(transaction: EVMTransaction): Promise<{ signature: string }> {
        if (!this.#client.account) throw new Error("No account connected");

        try {
            const signature = await this.#client.signTransaction({
                to: transaction.to as `0x${string}`,
                value: transaction.value ? BigInt(transaction.value.toString()) : undefined,
                data: transaction?.data,
                account: this.#client.account,
                chain: this.#client.chain,
                maxFeePerGas: transaction?.maxFeePerGas,
                accessList: transaction?.accessList,
                nonce: transaction?.nonce,
                gas: transaction?.gas,
                maxPriorityFeePerGas: transaction?.maxPriorityFeePerGas,
                // type: transaction?.type,
            });

            return { signature };
        } catch (error) {
            throw new Error(
                `Failed to sign transaction: ${JSON.stringify(transaction)}.

                Error: ${error}`
            );
        }
    }

    async sendTransaction(transaction: EVMTransaction) {
        try {
            const { to, abi, functionName, args, value, options, data } = transaction;
            if (!this.#client.account) throw new Error("No account connected");

            const toAddress = to as `0x${string}`;

            const paymaster = options?.paymaster?.address ?? this.#defaultPaymaster;
            const paymasterInput = options?.paymaster?.input ?? this.#defaultPaymasterInput;
            const txHasPaymaster = !!paymaster && !!paymasterInput;

            // If paymaster params exist, extend with EIP712 actions
            const sendingClient = txHasPaymaster ? this.#client.extend(eip712WalletActions()) : this.#client;

            // Simple ETH transfer (no ABI)
            if (!abi) {
                const txParams = {
                    account: this.#client.account,
                    to: toAddress,
                    chain: this.#client.chain,
                    value,
                    data,
                    ...(txHasPaymaster ? { paymaster, paymasterInput } : {}),
                };

                const txHash = await sendingClient.sendTransaction(txParams);
                return this.waitForReceipt(txHash);
            }

            // Contract call
            if (!functionName) {
                throw new Error("Function name is required for contract calls");
            }

            const { request } = await this.publicClient.simulateContract({
                account: this.#client.account,
                address: toAddress,
                abi: abi,
                functionName,
                args,
                chain: this.#client.chain,
                value: value,
            });

            if (txHasPaymaster) {
                const payMasterData = encodeFunctionData({
                    abi: abi,
                    functionName,
                    args,
                });
                // With paymaster, we must use sendTransaction() directly
                const txParams = {
                    account: this.#client.account,
                    chain: this.#client.chain,
                    to: request.address,
                    data: payMasterData,
                    value: request.value,
                    paymaster,
                    paymasterInput,
                };
                const txHash = await sendingClient.sendTransaction(txParams);
                return this.waitForReceipt(txHash);
            }

            // Without paymaster, use writeContract which handles encoding too,
            // but since we already have request, let's let writeContract do its thing.
            // However, writeContract expects the original request format (with abi, functionName, args).
            const txHash = await this.#client.writeContract(request);
            return this.waitForReceipt(txHash);
        } catch (error) {
            throw new Error(
                `Failed to send transaction: ${JSON.stringify(transaction)}.

                Error: ${error}`
            );
        }
    }

    async read(request: EVMReadRequest) {
        const { address, abi, functionName, args } = request;
        if (!abi) throw new Error("Read request must include ABI for EVM");

        try {
            const result = await this.publicClient.readContract({
                address: address as `0x${string}`,
                abi,
                functionName,
                args,
            });

            return { value: result };
        } catch (error) {
            throw new Error(
                `Failed read for ${request}.

                Error: ${error}`
            );
        }
    }

    async balanceOf(address: string) {
        try {
            const balance = await this.publicClient.getBalance({
                address: address as `0x${string}`,
            });

            const chain = this.#client.chain ?? mainnet;

            return {
                value: formatUnits(BigInt(balance), chain.nativeCurrency.decimals),
                decimals: chain.nativeCurrency.decimals,
                symbol: chain.nativeCurrency.symbol,
                name: chain.nativeCurrency.name,
                inBaseUnits: balance.toString(),
            };
        } catch (error) {
            throw new Error(
                `Failed fetching balance for ${address}.

                Error: ${error}`
            );
        }
    }

    private async waitForReceipt(txHash: `0x${string}`) {
        try {
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash: txHash,
            });
            return {
                hash: receipt.transactionHash,
                status: receipt.status,
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber,
                contractAddress: receipt.contractAddress,
                cumulativeGasUsed: receipt.cumulativeGasUsed,
                effectiveGasPrice: receipt.effectiveGasPrice,
                from: receipt.from,
                gasUsed: receipt.gasUsed,
                logs: receipt.logs,
                logsBloom: receipt.logsBloom,
                to: receipt.to,
                transactionHash: receipt.transactionHash,
                transactionIndex: receipt.transactionIndex,
                type: receipt.type,
            };
        } catch (error) {
            throw new Error(
                `Failed to wait for transaction receipt. Transaction hash: ${txHash}.

                Error: ${error}`
            );
        }
    }
}

export function viem(client: ViemWalletClient, options?: ViemOptions) {
    return new ViemEVMWalletClient(client, options);
}
