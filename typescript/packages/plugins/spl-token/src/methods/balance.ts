import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { type Connection, PublicKey } from "@solana/web3.js";

export async function balanceOf(connection: Connection, walletAddress: string, tokenAddress: string) {
    const tokenAccount = getAssociatedTokenAddressSync(new PublicKey(tokenAddress), new PublicKey(walletAddress));
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return balance;
}
