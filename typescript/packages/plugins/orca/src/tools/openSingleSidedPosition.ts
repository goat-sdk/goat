import { Wallet } from "@coral-xyz/anchor";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { Percentage, TransactionBuilder, resolveOrCreateATAs } from "@orca-so/common-sdk";
import {
    NO_TOKEN_EXTENSION_CONTEXT,
    ORCA_WHIRLPOOL_PROGRAM_ID,
    PDAUtil,
    PriceMath,
    TokenExtensionContextForPool,
    TokenExtensionUtil,
    WhirlpoolContext,
    buildWhirlpoolClient,
    increaseLiquidityQuoteByInputToken,
} from "@orca-so/whirlpools-sdk";
import { increaseLiquidityIx } from "@orca-so/whirlpools-sdk/dist/instructions";
import { increaseLiquidityV2Ix } from "@orca-so/whirlpools-sdk/dist/instructions";
import { openPositionWithTokenExtensionsIx } from "@orca-so/whirlpools-sdk/dist/instructions";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { OpenSingleSidedPositionParameters } from "../parameters";

export async function openSingleSidedPosition(
    walletClient: SolanaWalletClient,
    parameters: OpenSingleSidedPositionParameters,
) {
    const vanityWallet = new Wallet(new Keypair());
    const ctx = WhirlpoolContext.from(walletClient.getConnection(), vanityWallet, ORCA_WHIRLPOOL_PROGRAM_ID);
    const walletAddress = new PublicKey(walletClient.getAddress());

    const whirlpoolAddress = new PublicKey(parameters.whirlpoolAddress);
    const distanceFromCurrentPriceBps = Number(parameters.distanceFromCurrentPriceBps);
    const widthBps = Number(parameters.widthBps);
    const inputTokenMint = new PublicKey(parameters.inputTokenMint);
    const inputAmount = new Decimal(parameters.inputAmount);
    const tokenProgramId = TOKEN_2022_PROGRAM_ID;
    const client = buildWhirlpoolClient(ctx);

    const whirlpool = await client.getPool(whirlpoolAddress);
    const whirlpoolData = whirlpool.getData();
    const mintInfoA = whirlpool.getTokenAInfo();
    const mintInfoB = whirlpool.getTokenBInfo();
    const price = PriceMath.sqrtPriceX64ToPrice(whirlpoolData.sqrtPrice, mintInfoA.decimals, mintInfoB.decimals);

    const isTokenA = inputTokenMint.equals(mintInfoA.mint);
    let lowerBoundPrice: Decimal;
    let upperBoundPrice: Decimal;
    let lowerTick: number;
    let upperTick: number;
    if (isTokenA) {
        lowerBoundPrice = price.mul(1 + distanceFromCurrentPriceBps / 10000);
        upperBoundPrice = lowerBoundPrice.mul(1 + widthBps / 10000);
        upperTick = PriceMath.priceToInitializableTickIndex(
            upperBoundPrice,
            mintInfoA.decimals,
            mintInfoB.decimals,
            whirlpoolData.tickSpacing,
        );
        lowerTick = PriceMath.priceToInitializableTickIndex(
            lowerBoundPrice,
            mintInfoA.decimals,
            mintInfoB.decimals,
            whirlpoolData.tickSpacing,
        );
    } else {
        lowerBoundPrice = price.mul(1 - distanceFromCurrentPriceBps / 10000);
        upperBoundPrice = lowerBoundPrice.mul(1 - widthBps / 10000);
        lowerTick = PriceMath.priceToInitializableTickIndex(
            upperBoundPrice,
            mintInfoA.decimals,
            mintInfoB.decimals,
            whirlpoolData.tickSpacing,
        );
        upperTick = PriceMath.priceToInitializableTickIndex(
            lowerBoundPrice,
            mintInfoA.decimals,
            mintInfoB.decimals,
            whirlpoolData.tickSpacing,
        );
    }

    const txBuilderTickArrays = await whirlpool.initTickArrayForTicks([lowerTick, upperTick], walletAddress);
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
    const { liquidityAmount: liquidity, tokenMaxA, tokenMaxB } = increaseLiquiditQuote;

    const positionMintKeypair = Keypair.generate();
    const positionMintPubkey = positionMintKeypair.publicKey;
    const positionPda = PDAUtil.getPosition(ctx.program.programId, positionMintPubkey);
    const positionTokenAccountAddress = getAssociatedTokenAddressSync(
        positionMintPubkey,
        walletAddress,
        ctx.accountResolverOpts.allowPDAOwnerAddress,
        tokenProgramId,
    );
    const txBuilder = new TransactionBuilder(ctx.provider.connection, ctx.provider.wallet, ctx.txBuilderOpts);
    const params = {
        funder: walletAddress,
        owner: walletAddress,
        positionPda,
        positionTokenAccount: positionTokenAccountAddress,
        whirlpool: whirlpoolAddress,
        tickLowerIndex: lowerTick,
        tickUpperIndex: upperTick,
    };
    const positionIx = openPositionWithTokenExtensionsIx(ctx.program, {
        ...params,
        positionMint: positionMintPubkey,
        withTokenMetadataExtension: true,
    });
    txBuilder.addSigner(positionMintKeypair);
    txBuilder.addInstruction(positionIx);
    const [ataA, ataB] = await resolveOrCreateATAs(
        ctx.connection,
        walletAddress,
        [
            { tokenMint: mintInfoA.address, wrappedSolAmountIn: tokenMaxA },
            { tokenMint: mintInfoB.address, wrappedSolAmountIn: tokenMaxB },
        ],
        () => ctx.fetcher.getAccountRentExempt(),
        walletAddress,
        undefined,
        ctx.accountResolverOpts.allowPDAOwnerAddress,
        "ata",
    );
    const { address: tokenOwnerAccountA, ...tokenOwnerAccountAIx } = ataA;
    const { address: tokenOwnerAccountB, ...tokenOwnerAccountBIx } = ataB;
    txBuilder.addInstruction(tokenOwnerAccountAIx);
    txBuilder.addInstruction(tokenOwnerAccountBIx);

    const tickArrayLowerPda = PDAUtil.getTickArrayFromTickIndex(
        lowerTick,
        whirlpoolData.tickSpacing,
        whirlpoolAddress,
        ctx.program.programId,
    );
    const tickArrayUpperPda = PDAUtil.getTickArrayFromTickIndex(
        upperTick,
        whirlpoolData.tickSpacing,
        whirlpoolAddress,
        ctx.program.programId,
    );

    const baseParamsLiquidity = {
        liquidityAmount: liquidity,
        tokenMaxA,
        tokenMaxB,
        whirlpool: whirlpoolAddress,
        positionAuthority: walletAddress,
        position: positionPda.publicKey,
        positionTokenAccount: positionTokenAccountAddress,
        tokenOwnerAccountA,
        tokenOwnerAccountB,
        tokenVaultA: whirlpoolData.tokenVaultA,
        tokenVaultB: whirlpoolData.tokenVaultB,
        tickArrayLower: tickArrayLowerPda.publicKey,
        tickArrayUpper: tickArrayUpperPda.publicKey,
    };

    const liquidityIx = !TokenExtensionUtil.isV2IxRequiredPool(tokenExtensionCtx)
        ? increaseLiquidityIx(ctx.program, baseParamsLiquidity)
        : increaseLiquidityV2Ix(ctx.program, {
              ...baseParamsLiquidity,
              tokenMintA: mintInfoA.address,
              tokenMintB: mintInfoB.address,
              tokenProgramA: tokenExtensionCtx.tokenMintWithProgramA.tokenProgram,
              tokenProgramB: tokenExtensionCtx.tokenMintWithProgramB.tokenProgram,
          });
    txBuilder.addInstruction(liquidityIx);

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
            positionMint: positionMintPubkey.toString(),
        });
    } catch (error) {
        throw new Error(`Failed to create position: ${JSON.stringify(error)}`);
    }
}
