import type { SolanaWalletClient } from "@goat-sdk/core";
import type { NetworkSpecificToken } from "../tokens";
import { type Connection, PublicKey, type TransactionInstruction } from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    createTransferInstruction,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { doesAccountExist } from "../utils/doesAccountExist";

export async function transfer(
    connection: Connection,
    walletClient: SolanaWalletClient,
    to: string,
    token: NetworkSpecificToken,
    amount: string,
) {
    const tokenMintPublicKey = new PublicKey(token.mintAddress);
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
