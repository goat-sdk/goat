import { Wallet } from "@coral-xyz/anchor";
import { createToolParameters } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { Percentage } from "@orca-so/common-sdk";
import {
    NO_TOKEN_EXTENSION_CONTEXT,
    ORCA_WHIRLPOOL_PROGRAM_ID,
    PoolUtil,
    PriceMath,
    TokenExtensionContextForPool,
    WhirlpoolContext,
    buildWhirlpoolClient,
    increaseLiquidityQuoteByInputToken,
} from "@orca-so/whirlpools-sdk";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { z } from "zod";
import { FEE_TIERS } from "../orca.service";

export class OpenCenteredPositionParameters extends createToolParameters(
    z.object({
        whirlpoolAddress: z.string().describe("The address of the Orca Whirlpool."),
        priceOffsetBps: z.string().describe("The basis point offset (one side) from the current pool price."),
        inputTokenMint: z.string().describe("The mint address of the token to deposit."),
        inputAmount: z.string().describe("The amount of the input token to deposit."),
    }),
) {}

export async function openCenteredPosition(
    walletClient: SolanaWalletClient,
    parameters: OpenCenteredPositionParameters,
) {
    const vanityWallet = new Wallet(new Keypair());
    const ctx = WhirlpoolContext.from(walletClient.getConnection(), vanityWallet, ORCA_WHIRLPOOL_PROGRAM_ID);

    const whirlpoolAddress = new PublicKey(parameters.whirlpoolAddress);
    const priceOffsetBps = Number(parameters.priceOffsetBps);
    const inputTokenMint = new PublicKey(parameters.inputTokenMint);
    const inputAmount = new Decimal(parameters.inputAmount);
    const client = buildWhirlpoolClient(ctx);

    const whirlpool = await client.getPool(whirlpoolAddress);
    const whirlpoolData = whirlpool.getData();
    const mintInfoA = whirlpool.getTokenAInfo();
    const mintInfoB = whirlpool.getTokenBInfo();
    const price = PriceMath.sqrtPriceX64ToPrice(whirlpoolData.sqrtPrice, mintInfoA.decimals, mintInfoB.decimals);

    const lowerPrice = price.mul(1 - priceOffsetBps / 10000);
    const upperPrice = price.mul(1 + priceOffsetBps / 10000);
    const lowerTick = PriceMath.priceToInitializableTickIndex(
        lowerPrice,
        mintInfoA.decimals,
        mintInfoB.decimals,
        whirlpoolData.tickSpacing,
    );
    const upperTick = PriceMath.priceToInitializableTickIndex(
        upperPrice,
        mintInfoA.decimals,
        mintInfoB.decimals,
        whirlpoolData.tickSpacing,
    );

    const txBuilderTickArrays = await whirlpool.initTickArrayForTicks([lowerTick, upperTick]);
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];
    if (txBuilderTickArrays !== null) {
        const txPayloadTickArrays = await txBuilderTickArrays.build();
        const txPayloadTickArraysDecompiled = TransactionMessage.decompile(
            (txPayloadTickArrays.transaction as VersionedTransaction).message,
        );
        const instructionsTickArrays = txPayloadTickArraysDecompiled.instructions;
        instructions = instructions.concat(instructionsTickArrays);
        signers = signers.concat(txPayloadTickArrays.signers as Keypair[]);
    }

    const tokenExtensionCtx: TokenExtensionContextForPool = {
        ...NO_TOKEN_EXTENSION_CONTEXT,
        tokenMintWithProgramA: mintInfoA,
        tokenMintWithProgramB: mintInfoB,
    };
    const increaseLiquiditQuote = increaseLiquidityQuoteByInputToken(
        inputTokenMint,
        inputAmount,
        lowerTick,
        upperTick,
        Percentage.fromFraction(1, 100),
        whirlpool,
        tokenExtensionCtx,
    );
    const { positionMint, tx: txBuilder } = await whirlpool.openPositionWithMetadata(
        lowerTick,
        upperTick,
        increaseLiquiditQuote,
        undefined,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID,
    );

    const txPayload = await txBuilder.build();
    const txPayloadDecompiled = TransactionMessage.decompile((txPayload.transaction as VersionedTransaction).message);
    instructions = instructions.concat(txPayloadDecompiled.instructions);
    signers = signers.concat(txPayload.signers as Keypair[]);

    try {
        const { hash } = await walletClient.sendTransaction({
            instructions: instructions,
            accountsToSign: signers,
        });
        return JSON.stringify({
            transactionId: hash,
            positionMint: positionMint.toString(),
        });
    } catch (error) {
        throw new Error(`Failed to create pool: ${JSON.stringify(error)}`);
    }
}
