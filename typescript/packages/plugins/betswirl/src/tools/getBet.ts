import { createTool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { type Hex } from "viem";
import { z } from "zod";

import { CasinoChainId, fetchBetByHash } from "@betswirl/sdk-core";

export function createGetBetTool(walletClient: EVMWalletClient, theGraphKey?: string) {
    return createTool(
        {
            name: "betswirl.getBet",
            description: "Get a bet from its hash.",
            parameters: z.object({
                hash: z.string().describe("The bet hash"),
            }),
        },
        async (parameters) => {
            const hash = parameters.hash as Hex;
            const chainId = walletClient.getChain().id as CasinoChainId;

            const bet = await getBet(chainId, hash, theGraphKey);

            return bet;
        },
    );
}

export async function getBet(chainId: CasinoChainId, txHash: Hex, theGraphKey?: string) {
    try {
        let betData = await fetchBetByHash(txHash, { chainId, theGraphKey });
        const startTime = Date.now(); // Record the start time
        const timeout = 60000; // 1 minute timeout
        while ((!betData.bet || !betData.bet.isResolved) && !betData.error) {
            if (Date.now() - startTime >= timeout) {
                throw new Error("Timeout: Bet data retrieval exceeded 1 minute.");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
            betData = await fetchBetByHash(txHash, { chainId, theGraphKey });
            if (betData.error) {
                break;
            }
        }
        if (betData.error) {
            throw new Error(`[${betData.error.code}] Error fetching bet: ${betData.error.message}`);
        }
        return betData.bet;
    } catch (error) {
        throw new Error(`An error occured while getting the bet: ${error}`);
    }
}
