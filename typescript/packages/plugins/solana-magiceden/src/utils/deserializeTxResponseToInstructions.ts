import { type Connection, VersionedTransaction } from "@solana/web3.js";
import type { z } from "zod";
import type { getBuyListingTransactionResponseSchema } from "../parameters";
import { decompileVersionedTransactionToInstructions } from "./decompileVersionedTransactionToInstructions";

export async function deserializeTxResponseToInstructions(
    connection: Connection,
    txResponse: z.infer<typeof getBuyListingTransactionResponseSchema>,
) {
    const txV0 = txResponse.v0.txSigned;
    if (txV0 == null) {
        throw new Error("No transaction in response");
    }
    const versionedTransaction = VersionedTransaction.deserialize(Buffer.from(txV0.data));
    const instructions = await decompileVersionedTransactionToInstructions(connection, versionedTransaction);
    return { versionedTransaction, instructions };
}
