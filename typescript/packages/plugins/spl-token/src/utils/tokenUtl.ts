import { type Cluster, Connection } from "@solana/web3.js";
import { UtlConfig } from "@solflare-wallet/utl-sdk";

export function createUtlConfig(connection: Connection, network: Cluster) {
    return new UtlConfig({
        /**
         * 101 - mainnet, 102 - testnet, 103 - devnet
         */
        chainId:
            network === "mainnet-beta"
                ? 101
                : network === "testnet"
                ? 102
                : 103,
        /**
         * number of miliseconds to wait until falling back to CDN
         */
        timeout: 2000,
        /**
         * Solana web3 Connection
         */
        connection: connection,
        /**
         * Backend API url which is used to query tokens.
         * URL `https://token-list-api.solana.cloud` pulls from https://github.com/solflare-wallet/token-list
         */
        apiUrl: "https://token-list-api.solana.cloud",
        /**
         * CDN hosted static token list json which is used in case backend is down
         */
        cdnUrl: "https://cdn.jsdelivr.net/gh/solflare-wallet/token-list/solana-tokenlist.json",
    });
}
