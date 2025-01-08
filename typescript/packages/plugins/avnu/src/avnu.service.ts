import { Tool } from "@goat-sdk/core";
import { Account, RpcProvider } from "starknet";
import { ConfigSchema, GetQuoteBodySchema } from "./types";
import { AvnuOptions, executeSwap, fetchQuotes, type Quote } from "@avnu/avnu-sdk";

export class AvnuService {
    private params: ConfigSchema;
    account: Account;
    avnu_options: AvnuOptions;

    constructor() {
        this.params = this.createProviderConfig();
        const provider = new RpcProvider({ nodeUrl: this.params.Starknet_rpc });
        this.avnu_options = { baseUrl: this.params.base_url };
        this.account = new Account(
            provider,
            this.params.account_address,
            this.params.private_key
        );
    }

    async getQuote(params: GetQuoteBodySchema): Promise<Quote[]> {
        try {
            const quotes = await fetchQuotes(params, this.avnu_options);
            if (!quotes.length) {
                throw new Error("No quotes available");
            }
            return quotes;
        } catch (error) {
            console.error("Error fetching quotes:", error);
            throw error;
        }
    }

    async Swap(quote: Quote) {
        try {
            const swapResponse = await executeSwap(
                this.account,
                quote,
                {
                    executeApprove: true,
                    slippage: 0.01
                },
                this.avnu_options
            );
            return swapResponse;
        } catch (error) {
            console.error("Error executing swap:", error);
            throw error;
        }
    }

    private createProviderConfig(): ConfigSchema {
        const base_url = process.env.BASE_URL;
        const Starknet_rpc = process.env.STARKNET_RPC || "https://starknet-mainnet.public.blastapi.io/rpc/v0_6";
        const private_key = process.env.PRIVATE_KEY;
        const account_address = process.env.ACCOUNT_ADDRESS;

        if (!private_key || !account_address) {
            throw new Error("PRIVATE_KEY and ACCOUNT_ADDRESS must be set in environment variables");
        }

        return {
            base_url: base_url || 'https://starknet.api.avnu.fi',
            Starknet_rpc,
            private_key,
            account_address
        };
    }
}
