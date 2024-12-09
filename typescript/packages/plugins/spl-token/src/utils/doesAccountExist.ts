import type { PublicKey, Connection } from "@solana/web3.js";

export async function doesAccountExist(connection: Connection, address: PublicKey) {
    const account = await connection.getAccountInfo(address);
    return account != null;
}
