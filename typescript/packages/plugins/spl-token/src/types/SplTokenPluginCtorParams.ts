import { Connection } from "@solana/web3.js";
import { SolanaNetwork, Token } from "../tokens";

export interface SplTokenPluginCtorParams {
    connection: Connection;
    network: SolanaNetwork;
    tokens?: Token[];
}
