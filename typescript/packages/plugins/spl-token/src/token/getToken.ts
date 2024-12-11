import { type Cluster, Connection, PublicKey } from "@solana/web3.js";
import { Client, Token } from "@solflare-wallet/utl-sdk";

import { createUtlConfig } from "../utils/tokenUtl";

export async function getTokenByMintAddress(
    mintAddress: string,
    connection: Connection,
    network: Cluster
): Promise<Token | null> {
    const utl = new Client(createUtlConfig(connection, network));
    const token = await utl.fetchMint(new PublicKey(mintAddress));
    return token || null;
}

export async function getTokenBySymbol(
    symbol: string,
    connection: Connection,
    network: Cluster
): Promise<Token | null> {
    const utl = new Client(createUtlConfig(connection, network));
    const tokens = await utl.searchMints(symbol, {
        start: 0,
        limit: 1, // get the highest ranked token (by score)
    });

    return tokens.length === 0 ? null : tokens[0];
}

export async function getTokenMintAddressBySymbol(
    symbol: string,
    connection: Connection,
    network: Cluster
): Promise<string | null> {
    const token = await getTokenBySymbol(symbol, connection, network);
    return token ? token.address : null;
}
