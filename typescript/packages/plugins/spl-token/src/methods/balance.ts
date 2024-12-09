import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { type Connection, PublicKey } from "@solana/web3.js";
import type { NetworkSpecificToken } from "../tokens";

export async function balanceOf(connection: Connection, walletAddress: string, token: NetworkSpecificToken) {
    const tokenAccount = getAssociatedTokenAddressSync(new PublicKey(token.mintAddress), new PublicKey(walletAddress));
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return balance;
}
