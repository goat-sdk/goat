import type { EVMReadRequest, EVMTransaction, EVMTypedData, EVMWalletClient } from "@goat-sdk/core";
import { type WalletClient as ViemWalletClient, encodeFunctionData, publicActions } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { eip712WalletActions, getGeneralPaymasterInput } from "viem/zksync";

export type ViemOptions = {
    paymaster?: {
        defaultAddress: `0x${string}`;
        defaultInput?: `0x${string}`;
    };
};

export function viem(client: ViemWalletClient, options?: ViemOptions): EVMWalletClient {
    const defaultPaymaster = options?.paymaster?.defaultAddress ?? "";
    const defaultPaymasterInput =
        options?.paymaster?.defaultInput ??
        getGeneralPaymasterInput({
            innerInput: "0x",
        });

    const publicClient = client.extend(publicActions);

    const waitForReceipt = async (hash: `0x${string}`) => {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        return { hash: receipt.transactionHash, status: receipt.status };
    };

    return {
        getAddress: () => client.account?.address ?? "",
        getChain() {
            return {
                type: "evm",
                id: client.chain?.id ?? 0,
            };
        },
        async resolveAddress(address: string) {
            if (/^0x[a-fA-F0-9]{40}$/.test(address)) return address as `0x${string}`;

            try {
                const resolvedAddress = (await publicClient.getEnsAddress({
                    name: normalize(address),
                })) as `0x${string}`;
                if (!resolvedAddress) {
                    throw new Error("ENS name could not be resolved.");
                }
                return resolvedAddress as `0x${string}`;
            } catch (error) {
                throw new Error(`Failed to resolve ENS name: ${error}`);
            }
        },
        async signMessage(message: string) {
            if (!client.account) throw new Error("No account connected");
            const signature = await client.signMessage({
                message,
                account: client.account,
            });

            return { signature };
        },
        async signTypedData(data: EVMTypedData) {
            if (!client.account) throw new Error("No account connected");

            const signature = await client.signTypedData({
                domain: {
                    ...data.domain,
                    chainId:
                        typeof data.domain.chainId === "bigint" ? Number(data.domain.chainId) : data.domain.chainId,
                },
                types: data.types,
                primaryType: data.primaryType,
                message: data.message,
                account: client.account,
            });

            return { signature };
        },
        async sendTransaction(transaction: EVMTransaction) {
            const { to, abi, functionName, args, value, options } = transaction;
            if (!client.account) throw new Error("No account connected");

            const toAddress = await this.resolveAddress(to);

            const paymaster = options?.paymaster?.address ?? defaultPaymaster;
            const paymasterInput = options?.paymaster?.input ?? defaultPaymasterInput;
            const txHasPaymaster = !!paymaster && !!paymasterInput;

            // If paymaster params exist, extend with EIP712 actions
            const sendingClient = txHasPaymaster ? client.extend(eip712WalletActions()) : client;

            // Simple ETH transfer (no ABI)
            if (!abi) {
                const txParams = {
                    account: client.account,
                    to: toAddress,
                    chain: client.chain,
                    value,
                    ...(txHasPaymaster ? { paymaster, paymasterInput } : {}),
                };

                const txHash = await sendingClient.sendTransaction(txParams);
                return waitForReceipt(txHash);
            }

            // Contract call
            if (!functionName) {
                throw new Error("Function name is required for contract calls");
            }

            const { request } = await publicClient.simulateContract({
                account: client.account,
                address: toAddress,
                abi: abi,
                functionName,
                args,
                chain: client.chain,
            });

            // Encode the call data ourselves
            const data = encodeFunctionData({
                abi: abi,
                functionName,
                args,
            });

            if (txHasPaymaster) {
                // With paymaster, we must use sendTransaction() directly
                const txParams = {
                    account: client.account,
                    chain: client.chain,
                    to: request.address,
                    data,
                    value: request.value,
                    paymaster,
                    paymasterInput,
                };
                const txHash = await sendingClient.sendTransaction(txParams);
                return waitForReceipt(txHash);
            }

            // Without paymaster, use writeContract which handles encoding too,
            // but since we already have request, let's let writeContract do its thing.
            // However, writeContract expects the original request format (with abi, functionName, args).
            const txHash = await client.writeContract(request);
            return waitForReceipt(txHash);
        },
        async read(request: EVMReadRequest) {
            const { address, abi, functionName, args } = request;
            if (!abi) throw new Error("Read request must include ABI for EVM");

            const result = await publicClient.readContract({
                address: await this.resolveAddress(address),
                abi,
                functionName,
                args,
            });

            return { value: result };
        },
        async balanceOf(address: string) {
            const resolvedAddress = await this.resolveAddress(address);
            const balance = await publicClient.getBalance({
                address: resolvedAddress,
            });

            const chain = client.chain ?? mainnet;

            return {
                value: balance,
                decimals: chain.nativeCurrency.decimals,
                symbol: chain.nativeCurrency.symbol,
                name: chain.nativeCurrency.name,
            };
        },
    };
}
