import type { SolanaWalletClient } from "@goat-sdk/core";
import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { type Connection, PublicKey, type TransactionInstruction } from "@solana/web3.js";
import type { SolanaNetwork } from "../tokens";
import { doesAccountExist } from "../utils/doesAccountExist";
import { getTokenByMintAddress } from "../utils/getTokenByMintAddress";

export async function transfer(
    connection: Connection,
    network: SolanaNetwork,
    walletClient: SolanaWalletClient,
    to: string,
    tokenMintAddress: string,
    amount: string,
) {
    const token = getTokenByMintAddress(tokenMintAddress, network);
    if (!token) {
        throw new Error(`Token with mint address ${tokenMintAddress} not found`);
    }

    const tokenMintPublicKey = new PublicKey(tokenMintAddress);
    const fromPublicKey = new PublicKey(walletClient.getAddress());
    const toPublicKey = new PublicKey(to);

    const fromTokenAccount = getAssociatedTokenAddressSync(tokenMintPublicKey, fromPublicKey);
    const toTokenAccount = getAssociatedTokenAddressSync(tokenMintPublicKey, toPublicKey);

    const fromAccountExists = await doesAccountExist(connection, fromTokenAccount);
    const toAccountExists = await doesAccountExist(connection, toTokenAccount);

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
