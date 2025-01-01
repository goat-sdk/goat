import { Wallet } from "@coral-xyz/anchor";
import { createToolParameters } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { Percentage } from "@orca-so/common-sdk";
import { ORCA_WHIRLPOOL_PROGRAM_ID, PDAUtil, WhirlpoolContext, buildWhirlpoolClient } from "@orca-so/whirlpools-sdk";
import { Keypair, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { z } from "zod";

export class ClosePositionParameters extends createToolParameters(
    z.object({
        positionMintAddress: z.string().describe("The mint address of the liquidity position to close."),
    }),
) {}

export async function closePosition(walletClient: SolanaWalletClient, parameters: ClosePositionParameters) {
    const vanityWallet = new Wallet(new Keypair());
    const ctx = WhirlpoolContext.from(walletClient.getConnection(), vanityWallet, ORCA_WHIRLPOOL_PROGRAM_ID);

    const positionMintAddress = new PublicKey(parameters.positionMintAddress);
    const client = buildWhirlpoolClient(ctx);

    const positionAddress = PDAUtil.getPosition(ORCA_WHIRLPOOL_PROGRAM_ID, positionMintAddress);
    const position = await client.getPosition(positionAddress.publicKey);
    const whirlpoolAddress = position.getData().whirlpool;
    const whirlpool = await client.getPool(whirlpoolAddress);
    const txBuilder = await whirlpool.closePosition(positionAddress.publicKey, Percentage.fromFraction(1, 100));
    const txPayload = await txBuilder[0].build();
    const txPayloadDecompiled = TransactionMessage.decompile((txPayload.transaction as VersionedTransaction).message);
    const instructions = txPayloadDecompiled.instructions;
    const signers = txPayload.signers as Keypair[];

    try {
        const { hash } = await walletClient.sendTransaction({
            instructions: instructions,
            accountsToSign: signers,
        });
        return hash;
    } catch (error) {
        throw new Error(`Failed to create pool: ${JSON.stringify(error)}`);
    }
}
