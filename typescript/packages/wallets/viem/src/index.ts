import type { EVMReadRequest, EVMTransaction, EVMTypedData, EVMWalletClient } from "@goat-sdk/core";

import { publicActions } from "viem";
import type { WalletClient as ViemWalletClient } from "viem";
import { normalize } from "viem/ens";

export function viem(client: ViemWalletClient): EVMWalletClient {
    const publicClient = client.extend(publicActions);

    return {
        getAddress: () => client.account?.address ?? "",
        getChain() {
            return {
                type: "evm",
                id: client.chain?.id ?? 0,
            };
        },
        async resolveAddress(address: string) {
            if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
                return address as `0x${string}`;
            }

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

            return {
                signature,
            };
        },
        async signTypedData(data: EVMTypedData) {
            if (!client.account) throw new Error("No account connected");

            const signature = await client.signTypedData({
                domain: data.domain,
                types: data.types,
                primaryType: data.primaryType,
                message: data.message,
                account: client.account,
            });

            return {
                signature,
            };
        },
        async sendTransaction(transaction: EVMTransaction) {
            const { to, abi, functionName, args, value } = transaction;

            const toAddress = await this.resolveAddress(to);
            if (!client.account) throw new Error("No account connected");

            if (!abi) {
                const tx = await client.sendTransaction({
                    account: client.account,
                    to: toAddress,
                    chain: client.chain,
                    value,
                });

                const transaction = await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });

                return {
                    hash: transaction.transactionHash,
                    status: transaction.status,
                };
            }

            if (!functionName) {
                throw new Error("Function name is required");
            }

            await publicClient.simulateContract({
                account: client.account,
                address: toAddress,
                abi,
                functionName,
                args,
                chain: client.chain,
            });
            const hash = await client.writeContract({
                account: client.account,
                address: toAddress,
                abi,
                functionName,
                args,
                chain: client.chain,
                value,
            });

            const t = await publicClient.waitForTransactionReceipt({
                hash: hash,
            });

            return {
                hash: t.transactionHash,
                status: t.status,
            };
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

            return {
                value: result,
            };
        },
        async balanceOf(address: string) {
            const resolvedAddress = await this.resolveAddress(address);

            const balance = await publicClient.getBalance({
                address: resolvedAddress,
            });

            return {
                value: balance,
                decimals: 18,
                symbol: "ETH",
                name: "Ether",
            };
        },
    };
}
