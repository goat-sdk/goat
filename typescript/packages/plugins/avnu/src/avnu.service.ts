import { Tool } from "@goat-sdk/core";
import { Account, provider, RpcProvider } from "starknet";
import { AvnuCtorParams, GetQuoteBodySchema } from "./types/AvnuCtorParams";
import { AvnuOptions, fetchQuotes } from "@avnu/avnu-sdk";

export class AvnuService {
    private params: AvnuCtorParams;
    account: Account;
    constructor() {
        this.params = this.createProviderConfig();
        const provider = new RpcProvider( { nodeUrl: this.params.Starknet_rpc});
        this.account = new Account(provider, this.params.account_address, this.params.private_key);
    } 



    async getQuote(params: GetQuoteBodySchema) {
        const avnu_options: AvnuOptions = { baseUrl: this.params.base_url}
        const quotes = await fetchQuotes(params, avnu_options);

        return quotes;
    }

    private createProviderConfig(): AvnuCtorParams {
        const base_url = process.env.BASE_URL;
        const Starknet_rpc = process.env.STARKNET_RPC; 
        const private_key = process.env.PRIVATE_KEY; 
        const account_address = process.env.ACCOUNT_ADDRESS;

        if (!base_url || !Starknet_rpc || !private_key || !account_address) {
            throw new Error("Missing required parameters for AvnuService");
        }

        return {base_url, Starknet_rpc, private_key, account_address}
    }
}
