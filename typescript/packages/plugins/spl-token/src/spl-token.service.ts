import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { type Connection, PublicKey, type TransactionInstruction } from "@solana/web3.js";
import {
    ConvertToBaseUnitParameters,
    GetTokenBalanceByMintAddressParameters,
    GetTokenMintAddressBySymbolParameters,
    TransferTokenByMintAddressParameters,
} from "./parameters";
import { SPL_TOKENS, type SolanaNetwork, type Token } from "./tokens";
import type { SplTokenPluginCtorParams } from "./types/SplTokenPluginCtorParams";
import { doesAccountExist } from "./utils/doesAccountExist";
import { getTokenByMintAddress } from "./utils/getTokenByMintAddress";

export class SplTokenService {
    private connection: Connection;
    private network: SolanaNetwork;
    private tokens: Token[];

    constructor({ network, tokens = SPL_TOKENS, connection }: SplTokenPluginCtorParams) {
        this.network = network;
        this.tokens = tokens;
        this.connection = connection;
    }

    @Tool({
        description: "Gets the SPL token info by its symbol, including the mint address, decimals, and name",
    })
    async getTokenInfoBySymbol(parameters: GetTokenMintAddressBySymbolParameters) {
        const token = this.tokens.find((token) =>
            [token.symbol, token.symbol.toLowerCase()].includes(parameters.symbol),
        );
        return {
            symbol: token?.symbol,
            mintAddress: token?.mintAddresses[this.network],
            decimals: token?.decimals,
            name: token?.name,
        };
    }

    @Tool({
        description: "Gets the balance of an SPL token by its mint address",
    })
    async getTokenBalanceByMintAddress(parameters: GetTokenBalanceByMintAddressParameters) {
        const { walletAddress, mintAddress } = parameters;
        const tokenAccount = getAssociatedTokenAddressSync(new PublicKey(mintAddress), new PublicKey(walletAddress));
        const balance = await this.connection.getTokenAccountBalance(tokenAccount);
        return balance;
    }

    @Tool({
        description: "Transfers an SPL token by its mint address.",
    })
    async transferTokenByMintAddress(
        walletClient: SolanaWalletClient,
        parameters: TransferTokenByMintAddressParameters,
    ) {
        const { to, mintAddress, amount } = parameters;

        const token = getTokenByMintAddress(mintAddress, this.network);
        if (!token) {
            throw new Error(`Token with mint address ${mintAddress} not found`);
        }

        const tokenMintPublicKey = new PublicKey(mintAddress);
        const fromPublicKey = new PublicKey(walletClient.getAddress());
        const toPublicKey = new PublicKey(to);

        const fromTokenAccount = getAssociatedTokenAddressSync(tokenMintPublicKey, fromPublicKey);
        const toTokenAccount = getAssociatedTokenAddressSync(tokenMintPublicKey, toPublicKey);

        const fromAccountExists = await doesAccountExist(this.connection, fromTokenAccount);
        const toAccountExists = await doesAccountExist(this.connection, toTokenAccount);

        if (!fromAccountExists) {
            throw new Error(`From account ${fromTokenAccount.toBase58()} does not exist`);
        }

        const instructions: TransactionInstruction[] = [];

        if (!toAccountExists) {
            instructions.push(
                createAssociatedTokenAccountInstruction(fromPublicKey, toTokenAccount, toPublicKey, tokenMintPublicKey),
            );
        }
        instructions.push(
            createTransferCheckedInstruction(
                fromTokenAccount,
                tokenMintPublicKey,
                toTokenAccount,
                fromPublicKey,
                BigInt(amount) * BigInt(10) ** BigInt(token.decimals),
                token.decimals,
            ),
        );

        return await walletClient.sendTransaction({ instructions });
    }

    @Tool({
        description: "Converts an amount of an SPL token to its base unit",
    })
    async convertToBaseUnit(parameters: ConvertToBaseUnitParameters) {
        const { amount, decimals } = parameters;
        const baseUnit = amount * 10 ** decimals;
        return baseUnit;
    }
}
