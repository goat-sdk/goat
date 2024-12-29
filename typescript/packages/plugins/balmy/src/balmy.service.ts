import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { buildSDK, QuoteRequest } from "@balmy/sdk";
import {
    GetBalanceParameters,
    GetAllowanceParameters,
    GetQuoteParameters,
    ExecuteSwapParameters
} from "./parameters";

export class BalmyService {
    private sdk;



    constructor() {
        this.sdk = buildSDK();
    }

    @Tool({
        description: "Get token balances for an account"
    })
    async getBalances(walletClient: EVMWalletClient, parameters: GetBalanceParameters) {
        const balances = await this.sdk.balanceService.getBalances({
            tokens: [{
                chainId: parameters.chainId,
                account: parameters.account,
                token: parameters.token
            }]
        });

        // Convert nested object structure with BigInt values to strings
        return Object.entries(balances).reduce((acc: Record<string, any>, [chainId, tokens]) => {
            acc[chainId] = Object.entries(tokens).reduce((tokenAcc: Record<string, any>, [token, balance]) => {
                tokenAcc[token] = Object.entries(balance).reduce((balAcc: Record<string, string>, [address, amount]) => {
                    // @ts-ignore
                    balAcc[address] = amount.toString();
                    return balAcc;
                }, {} as Record<string, string>);
                return tokenAcc;
            }, {} as Record<string, any>);
            return acc;
        }, {} as Record<string, any>);
    }

    @Tool({
        description: "Get token allowance for my account"
    })
    async getAllowances(walletClient: EVMWalletClient, parameters: GetAllowanceParameters) {
        return await this.sdk.allowanceService.getAllowanceInChain({
            chainId: parameters.chainId,
            token: parameters.token,
            owner: parameters.owner,
            spender: parameters.spender
        });
    }

    @Tool({
        description: "Get quotes for a token swap"
    })
    async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        
        const request: QuoteRequest = {
            chainId: parameters.chainId,
            sellToken: parameters.tokenIn,
            buyToken: parameters.tokenOut,
            order: parameters.order,
            slippagePercentage: parameters.slippagePercentage,
            gasSpeed: parameters.gasSpeed,
            takerAddress: parameters.takerAddress || "0x666446eC2343e9E7e3D75C4C5b6A15355Ec7d7D4",
            
        }

        console.log(request);
        
        const quotes = await this.sdk.quoteService.getQuotes({
            request: request,
            config: {
                timeout: "10s"
            }
        });

        console.log(quotes);

        return quotes;
    }

    @Tool({
        description: "Execute a swap using the best quote"
    })
    async executeSwap(walletClient: EVMWalletClient, parameters: ExecuteSwapParameters) {
        const quotes = await this.getQuote(walletClient, parameters);
        const bestQuote = quotes[0];

        console.log(bestQuote);
        return bestQuote;
        // return await walletClient.sendTransaction(
        //     bestQuote.tx as `0x${string}`
        // );
    }
} 