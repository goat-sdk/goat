import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { buildSDK } from "@balmy/sdk";
import { type Token } from "./types";
import {
    GetBalanceParameters,
    GetAllowanceParameters,
    GetQuoteParameters,
    ExecuteSwapParameters
} from "./parameters";

export class BalmyService {
    private sdk;
    private tokens: Token[];

    constructor({ tokens = [] }: { tokens?: Token[] } = {}) {
        this.tokens = tokens;
        this.sdk = buildSDK({});
    }

    @Tool({
        description: "Get balance for multiple tokens across chains"
    })
    async getBalance(walletClient: EVMWalletClient, parameters: GetBalanceParameters) {
        return await this.sdk.balanceService.getBalancesForTokens({
            account: parameters.account,
            tokens: parameters.tokens
        });
    }

    @Tool({
        description: "Get token allowances for multiple spenders"
    })
    async getAllowance(walletClient: EVMWalletClient, parameters: GetAllowanceParameters) {
        return await this.sdk.allowanceService.getAllowances({
            chainId: parameters.chainId,
            token: parameters.token,
            owner: parameters.owner,
            spenders: parameters.spenders
        });
    }

    @Tool({
        description: "Get quotes from all DEX aggregators for a swap"
    })
    async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        return await this.sdk.quoteService.getAllQuotesWithTxs({
            request: {
                chainId: parameters.chainId,
                sellToken: parameters.sellToken,
                buyToken: parameters.buyToken,
                order: parameters.order,
                slippagePercentage: parameters.slippagePercentage,
                takerAddress: await walletClient.getAddress(),
                gasSpeed: parameters.gasSpeed
            },
            config: parameters.config
        });
    }

    @Tool({
        description: "Execute a swap using the best quote"
    })
    async executeSwap(walletClient: EVMWalletClient, parameters: ExecuteSwapParameters) {
        const quotes = await this.getQuote(walletClient, parameters);
        const bestQuote = quotes[0];
        return await walletClient.sendTransaction(bestQuote.tx);
    }
} 