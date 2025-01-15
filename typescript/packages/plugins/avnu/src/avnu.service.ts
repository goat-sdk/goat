import { Tool } from "@goat-sdk/core";
import { Account, RpcProvider } from "starknet";
import { executeSwap, fetchQuotes, type Quote } from "@avnu/avnu-sdk";
import { SwapConfigParams } from "./parameters";

export class AvnuService {
    private params;
    account: Account;
    avnu_options;

    constructor() {
        this.params = this.createProviderConfig();
        const provider = new RpcProvider({
            nodeUrl: this.params.Starknet_rpc
        });
        this.avnu_options = {
            baseUrl: this.params.base_url
        };
        this.account = new Account(
            provider,
            this.params.account_address,
            this.params.private_key
        );
    }

    private async getQuote(params: {
        sellTokenAddress: string,
        buyTokenAddress: string,
        sellAmount: string
    }): Promise<Quote[]> {
        try {
            const sellAmountBigInt = BigInt(params.sellAmount);

            const quotes = await fetchQuotes({
                sellTokenAddress: params.sellTokenAddress,
                buyTokenAddress: params.buyTokenAddress,
                sellAmount: sellAmountBigInt,
                ...this.avnu_options
            });

            console.log({
                "Sell Token Address": params.sellTokenAddress,
                "Buy Token Address": params.buyTokenAddress,
                "Original Sell Amount": params.sellAmount,
                "Converted Sell Amount": sellAmountBigInt.toString(),
                "Sell Amount Type": typeof sellAmountBigInt,
            });

            console.log("Quotes:", quotes);

            if (!quotes || quotes.length === 0) {
                throw new Error("No quotes found");
            }

            return quotes;
        } catch (error) {
            if (error instanceof Error && error.message.includes("BigInt")) {
                console.error("Error converting sellAmount to BigInt:", error);
                throw new Error(`Invalid sellAmount format: ${params.sellAmount}`);
            }
            console.error("Error fetching quotes:", error);
            throw error;
        }
    }

    @Tool({
        name: "executeSwap",
        description: "Execute a token swap on Avnu, make sure to use the correct token addresses and amount"
    })
    async executeSwap(params: SwapConfigParams) {
        try {
            console.log("Executing swap with params:", params);
            const quotes = await this.getQuote(params);
            const bestQuote = quotes[0]; // Assuming the first quote is the best one

            const swapResponse = await executeSwap(
                this.account,
                bestQuote,
                { 
                    executeApprove: true,
                    slippage: 0.5 
                }, 
                this.avnu_options
            );
            return swapResponse;
        } catch (error) {
            console.error("Error executing swap:", error);
            throw error;
        }
    }

    private createProviderConfig() {
        const base_url = process.env.BASE_URL;
        const Starknet_rpc = process.env.STARKNET_RPC;
        const private_key = process.env.PRIVATE_KEY;
        const account_address = process.env.ACCOUNT_ADDRESS;

        if (!private_key || !account_address) {
            throw new Error("PRIVATE_KEY and ACCOUNT_ADDRESS must be set in environment variables");
        }

        return {
            base_url: base_url || "https://starknet.api.avnu.fi",
            Starknet_rpc,
            private_key,
            account_address
        };
    }
}
