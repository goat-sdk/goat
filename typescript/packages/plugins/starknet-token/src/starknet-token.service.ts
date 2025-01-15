import { Tool } from "@goat-sdk/core";
import { StarknetWalletClient } from "@goat-sdk/wallet-starknet";
import {
    ConvertToBaseUnitParameters,
    GetTokenBalanceByAddressParameters,
    GetTokenInfoBySymbolParameters,
    TransferTokenParameters,
} from "./parameters";
import { STARKNET_TOKENS, type StarknetNetwork, type Token } from "./tokens";
import type { StarknetTokenPluginCtorParams } from "./types/StarknetTokenPluginCtorParams";

export class StarknetTokenService {
    private network: StarknetNetwork;
    private tokens: Token[];

    constructor({ network = "mainnet", tokens = STARKNET_TOKENS }: StarknetTokenPluginCtorParams = {}) {
        this.network = network;
        this.tokens = tokens;
    }

    @Tool({
        description: "Get the Starknet token info by its symbol, including the contract address, decimals, and name",
    })
    async getTokenInfoBySymbol(parameters: GetTokenInfoBySymbolParameters) {
        const token = this.tokens.find((token) =>
            [token.symbol, token.symbol.toLowerCase()].includes(parameters.symbol),
        );
        return {
            symbol: token?.symbol,
            contractAddress: token?.addresses[this.network],
            decimals: token?.decimals,
            name: token?.name,
        };
    }

    @Tool({
        description: "Get the balance of a Starknet token by its contract address",
    })
    async getTokenBalanceByAddress(
        walletClient: StarknetWalletClient,
        parameters: GetTokenBalanceByAddressParameters,
    ) {
        // Implementation will depend on Starknet specific logic
        throw new Error("Not implemented");
    }

    @Tool({
        description: "Transfer a Starknet token by its contract address",
    })
    async transferToken(
        walletClient: StarknetWalletClient,
        parameters: TransferTokenParameters,
    ) {
        // Implementation will depend on Starknet specific logic
        throw new Error("Not implemented");
    }

    @Tool({
        description: "Convert an amount of a Starknet token to its base unit",
    })
    async convertToBaseUnit(parameters: ConvertToBaseUnitParameters) {
        const { amount, decimals } = parameters;
        const baseUnit = amount * 10 ** decimals;
        return baseUnit;
    }
} 