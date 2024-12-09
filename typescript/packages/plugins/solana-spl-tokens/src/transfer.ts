import {
    type Commitment,
    type ConfirmOptions,
    type Connection,
    PublicKey,
    sendAndConfirmTransaction,
    type Signer,
    Transaction,
} from "@solana/web3.js";
import { z } from "zod";
import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    TokenInvalidMintError,
    TokenInvalidOwnerError,
} from "@solana/spl-token";

export function splTransfer(connection: Connection): Plugin<SolanaWalletClient> {
    return {
        name: "spl_transfer",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async () => {
            return [
                {
                    name: "transfer_spl_token",
                    description:
                        "This {{tool}} sends an SPL token (e.g. USDC) from your wallet to an address on a Solana chain.",
                    parameters: transferSplTokenParametersSchema,
                    method: transferSplTokenMethod(connection),
                },
            ];
        },
    };
}

const transferSplTokenParametersSchema = z.object({
    recipientAddress: z.string().describe("The address to send the SPL token to"),
    tokenMintAddress: z.string().describe("The address of the SPL token to send"),
    amount: z.string().describe("The amount of SPL token to send"),
});

const transferSplTokenMethod =
    (connection: Connection) =>
    async (
        walletClient: SolanaWalletClient,
        { recipientAddress, tokenMintAddress, amount }: z.infer<typeof transferSplTokenParametersSchema>,
    ): Promise<string> => {
        const tokenMint = new PublicKey(tokenMintAddress);
        const recipient = new PublicKey(recipientAddress);
        await getOrCreateAssociatedTokenAccountWalletClient(connection, walletClient, tokenMint, recipient);
        const senderTokenAccount = await getOrCreateAssociatedTokenAccountWalletClient(
            connection,
            walletClient,
            tokenMint,
            new PublicKey(walletClient.getAddress()),
        );
        console.log(`Resolved sender token account: ${senderTokenAccount.address.toBase58()}`);
        const receiverTokenAccount = await getOrCreateAssociatedTokenAccountWalletClient(
            connection,
            walletClient,
            tokenMint,
            recipient,
        );
        console.log(`Resolved receiver token account: ${receiverTokenAccount.address.toBase58()}`);
        const result = await walletClient.sendTransaction({
            instructions: [
                createTransferInstruction(
                    senderTokenAccount.address,
                    receiverTokenAccount.address,
                    new PublicKey(walletClient.getAddress()),
                    BigInt(amount),
                ),
            ],
        });
        return result.hash;
    };

// Copied from @solana/spl-token with modifications to use WalletClient instead of Signer
type Account = Awaited<ReturnType<typeof getAccount>>;
export async function getOrCreateAssociatedTokenAccountWalletClient(
    connection: Connection,
    walletClient: SolanaWalletClient,
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    commitment?: Commitment,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<ReturnType<typeof getAccount>> {
    const associatedToken = getAssociatedTokenAddressSync(
        mint,
        owner,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId,
    );

    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account: Account;
    try {
        account = await getAccount(connection, associatedToken, commitment, programId);
    } catch (error: unknown) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const ix = createAssociatedTokenAccountInstruction(
                    new PublicKey(walletClient.getAddress()),
                    associatedToken,
                    owner,
                    mint,
                    programId,
                    associatedTokenProgramId,
                );

                await walletClient.sendTransaction({ instructions: [ix] });
            } catch (error: unknown) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }

            // Now this should always succeed
            account = await getAccount(connection, associatedToken, commitment, programId);
        } else {
            throw error;
        }
    }

    if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
    if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

    return account;
}
