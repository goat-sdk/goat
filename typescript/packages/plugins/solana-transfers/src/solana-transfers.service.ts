import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    AccountLayout,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress,
    getMint,
} from "@solana/spl-token";
import {
    AccountInfo,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    CheckSPLTokenInfoParams,
    NativeSPLTransferParams,
    NativeSolTransferParams,
} from "./parameters";

export class SolanaTransfersService {
    @Tool({
        name: "native_sol_transfer",
        description:
            "Transfer Solana (SOL) natively (Crossmint wallets supported)",
    })
    async nativeSolTransfer(
        walletClient: SolanaWalletClient,
        parameters: NativeSolTransferParams,
    ) {
        const fromPublicKey = new PublicKey(walletClient.getAddress());
        const toPublicKey = new PublicKey(parameters.recipient);

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: parameters.amount,
        });

        const { hash } = await walletClient.sendTransaction({
            instructions: [transferInstruction],
        });

        return { hash };
    }

    @Tool({
        name: "check_spl_token_info",
        description:
            "Check all SPL token accounts for a wallet, including non-standard accounts",
    })
    async checkSPLTokenInfo(
        walletClient: SolanaWalletClient,
        parameters: CheckSPLTokenInfoParams,
    ) {
        const connection = walletClient.getConnection();
        const ownerAddress =
            parameters.walletAddress || walletClient.getAddress();

        const tokenMintPublicKey = new PublicKey(parameters.tokenMint);
        const walletPublicKey = new PublicKey(ownerAddress);

        // Fetch token mint info to get decimals
        const mintInfo = await getMint(connection, tokenMintPublicKey);

        // Get all token accounts owned by the wallet for this specific mint
        const tokenAccounts = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { mint: tokenMintPublicKey },
        );

        // Calculate total balance across all accounts
        let totalRawBalance = 0;
        const accountDetails: TokenAccountInfo[] = [];

        for (const accountInfo of tokenAccounts.value) {
            const accountAddress = accountInfo.pubkey.toString();
            const accountData = AccountLayout.decode(accountInfo.account.data);
            const rawBalance = accountData.amount;

            totalRawBalance += Number(rawBalance);

            accountDetails.push({
                address: accountAddress,
                rawBalance: rawBalance.toString(),
                formattedBalance: this._formatTokenAmount(
                    rawBalance,
                    mintInfo.decimals,
                ),
            });
        }

        // Check the standard ATA for comparison
        const standardATA = await getAssociatedTokenAddress(
            tokenMintPublicKey,
            walletPublicKey,
            true,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        const standardATAExists = tokenAccounts.value.some(
            (account: { pubkey: PublicKey; account: AccountInfo<Buffer> }) =>
                account.pubkey.toString() === standardATA.toString(),
        );

        // Calculate total balance in token units
        const totalFormattedBalance = this._formatTokenAmount(
            totalRawBalance,
            mintInfo.decimals,
        );

        return {
            tokenMint: parameters.tokenMint,
            tokenDecimals: mintInfo.decimals,
            walletAddress: ownerAddress,
            standardATA: standardATA.toString(),
            standardATAExists,
            totalAccounts: tokenAccounts.value.length,
            totalRawBalance: totalRawBalance.toString(),
            totalFormattedBalance,
            hasBalance: totalRawBalance > 0,
            accounts: accountDetails,
        };
    }

    @Tool({
        name: "native_spl_transfer",
        description:
            "Transfer SPL tokens between wallets (Crossmint wallets supported)",
    })
    async nativeSPLTransfer(
        walletClient: SolanaWalletClient,
        parameters: NativeSPLTransferParams,
    ) {
        const senderPublicKey = new PublicKey(walletClient.getAddress());
        const recipientPublicKey = new PublicKey(parameters.recipient);
        const tokenMintPublicKey = new PublicKey(parameters.tokenMint);

        // Convert amount based on decimals and handle floating point precision
        const amountToSend = Math.round(
            parameters.amount * 10 ** parameters.decimals,
        );

        // Get the associated token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(
            tokenMintPublicKey,
            senderPublicKey,
            true,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        const recipientTokenAccount = await getAssociatedTokenAddress(
            tokenMintPublicKey,
            recipientPublicKey,
            true,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        const instructions: TransactionInstruction[] = [];

        // Check if recipient token account exists
        const connection = walletClient.getConnection();
        const recipientAccountInfo = await connection.getAccountInfo(
            recipientTokenAccount,
        );

        // Create the associated token account if it doesn't exist
        if (!recipientAccountInfo) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    senderPublicKey,
                    recipientTokenAccount,
                    recipientPublicKey,
                    tokenMintPublicKey,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID,
                ),
            );
        }

        // Add the transfer instruction
        instructions.push(
            createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                senderPublicKey,
                BigInt(amountToSend),
                [],
                TOKEN_PROGRAM_ID,
            ),
        );

        const { hash } = await walletClient.sendTransaction({ instructions });

        return {
            hash,
            sourceAccount: senderTokenAccount.toBase58(),
            destinationAccount: recipientTokenAccount.toBase58(),
            amount: amountToSend.toString(),
        };
    }

    /**
     * Formats a token amount based on decimals
     * @param amount - Raw token amount
     * @param decimals - Token decimals
     * @returns Formatted amount string
     * @private
     */
    private _formatTokenAmount(
        amount: number | bigint,
        decimals: number,
    ): string {
        return (Number(amount) / 10 ** decimals).toFixed(decimals);
    }
}

interface TokenAccountInfo {
    address: string;
    rawBalance: string;
    formattedBalance: string;
}
