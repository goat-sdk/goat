import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { Hex, concat, erc20Abi, maxUint256, numberToHex, size } from "viem";
import { GetPriceParameters } from "./parameters";

export class Referrer {
    constructor(
        public readonly swapFeeBps: number,
        public readonly swapFeeRecipient: string,
    ) {}
}

export class ZeroExService {
    constructor(
        private readonly apiKey: string,
        private readonly referrer?: Referrer,
    ) {}

    private async makeRequest(path: string, queryParams: Record<string, string | undefined>) {
        const filteredParams = Object.fromEntries(
            Object.entries(queryParams).filter(([_, v]) => v !== undefined),
        ) as Record<string, string>;

        const url = new URL(`https://api.0x.org${path}?${new URLSearchParams(filteredParams).toString()}`);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "0x-api-key": this.apiKey,
                "0x-version": "v2",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${JSON.stringify(await response.text(), null, 2)}`);
        }

        return response.json();
    }

    @Tool({
        name: "0x_get_price",
        description: "Get the price of a token",
    })
    async getPrice(walletClient: EVMWalletClient, parameters: GetPriceParameters) {
        const queryParams = {
            chainId: walletClient.getChain().id.toString(),
            sellToken: parameters.sellToken,
            buyToken: parameters.buyToken,
            sellAmount: parameters.sellAmount,
            taker: walletClient.getAddress(),
            txOrigin: walletClient.getAddress(),
            slippageBps: parameters.slippageBps?.toString(),
            ...(this.referrer && {
                swapFeeBps: this.referrer.swapFeeBps.toString(),
                swapFeeToken: parameters.sellToken,
                swapFeeRecipient: this.referrer.swapFeeRecipient,
            }),
        };

        return await this.makeRequest("/swap/permit2/price", queryParams);
    }

    @Tool({
        name: "0x_swap",
        description: "Swap tokens using 0x",
    })
    async swap(walletClient: EVMWalletClient, parameters: GetPriceParameters) {
        const price = await this.getPrice(walletClient, parameters);

        if (price.issues.allowance !== null) {
            await walletClient.sendTransaction({
                to: price.issues.allowance.spender,
                abi: erc20Abi,
                functionName: "approve",
                args: [price.issues.allowance.spender, maxUint256],
            });
        }

        const quote = await this.makeRequest("/swap/permit2/quote", {
            chainId: walletClient.getChain().id.toString(),
            sellToken: parameters.sellToken,
            buyToken: parameters.buyToken,
            sellAmount: parameters.sellAmount,
            taker: walletClient.getAddress(),
            txOrigin: walletClient.getAddress(),
            slippageBps: parameters.slippageBps?.toString(),
            ...(this.referrer && {
                swapFeeBps: this.referrer.swapFeeBps.toString(),
                swapFeeToken: parameters.sellToken,
                swapFeeRecipient: this.referrer.swapFeeRecipient,
            }),
        });

        let signature: Hex | undefined;

        if (quote.permit2?.eip712) {
            signature = (
                await walletClient.signTypedData({
                    domain: quote.permit2.eip712.domain,
                    types: quote.permit2.eip712.types,
                    primaryType: quote.permit2.eip712.primaryType,
                    message: quote.permit2.eip712.message,
                })
            ).signature as Hex;

            const signatureLengthInHex = numberToHex(size(signature), {
                signed: false,
                size: 32,
            });

            const transactionData = quote.transaction.data as Hex;
            const sigLengthHex = signatureLengthInHex as Hex;
            const sig = signature as Hex;

            quote.transaction.data = concat([transactionData, sigLengthHex, sig]);
        }

        const transaction = quote.transaction;

        const tx = await walletClient.sendTransaction({
            to: transaction.to,
            value: transaction.value,
            data: transaction.data,
        });

        return tx.hash;
    }
}
