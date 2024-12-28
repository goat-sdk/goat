import {
    ComputeBudgetProgram,
    type Keypair,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { type SolanWalletClientCtorParams, SolanaWalletClient } from "./SolanaWalletClient";
import type { SolanaTransaction } from "./types";

export type SolanaKeypairWalletClientCtorParams = SolanWalletClientCtorParams & {
    keypair: Keypair;
};

export class SolanaKeypairWalletClient extends SolanaWalletClient {
    #keypair: Keypair;

    constructor(params: SolanaKeypairWalletClientCtorParams) {
        const { keypair, connection } = params;
        super({ connection });
        this.#keypair = keypair;
    }

    getAddress() {
        return this.#keypair.publicKey.toBase58();
    }

    async signMessage(message: string) {
        const messageBytes = Buffer.from(message);
        const signature = nacl.sign.detached(messageBytes, this.#keypair.secretKey);
        return {
            signature: Buffer.from(signature).toString("hex"),
        };
    }

    async sendTransaction({
        instructions,
        addressLookupTableAddresses = [],
        accountsToSign = [],
    }: SolanaTransaction): Promise<{ hash: string }> {
        const ixComputeBudget = await this.getComputeBudgetInstructions(instructions, "mid");
        const allInstructions = [
            ixComputeBudget.computeBudgetLimitInstruction,
            ixComputeBudget.computeBudgetPriorityFeeInstructions,
            ...instructions,
        ];
        const messageV0 = new TransactionMessage({
            payerKey: this.#keypair.publicKey,
            recentBlockhash: ixComputeBudget.blockhash,
            instructions: allInstructions,
        }).compileToV0Message(await this.getAddressLookupTableAccounts(addressLookupTableAddresses));
        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([this.#keypair, ...accountsToSign]);

        const timeoutMs = 90000;
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            const transactionStartTime = Date.now();

            const hash = await this.connection.sendTransaction(transaction, {
                maxRetries: 0,
                skipPreflight: true,
            });

            const statuses = await this.connection.getSignatureStatuses([hash]);
            if (statuses.value[0]) {
                if (!statuses.value[0].err) {
                    return { hash };
                }
            }

            const elapsedTime = Date.now() - transactionStartTime;
            const remainingTime = Math.max(0, 1000 - elapsedTime);
            if (remainingTime > 0) {
                await new Promise((resolve) => setTimeout(resolve, remainingTime));
            }
        }
        throw new Error("Transaction timeout");
    }

    private priorityFeeTiers = {
        min: 0.01,
        mid: 0.5,
        max: 0.95,
    };

    private async getComputeBudgetInstructions(
        instructions: TransactionInstruction[],
        feeTier: keyof typeof this.priorityFeeTiers,
    ): Promise<{
        blockhash: string;
        computeBudgetLimitInstruction: TransactionInstruction;
        computeBudgetPriorityFeeInstructions: TransactionInstruction;
    }> {
        try {
            const blockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const messageV0 = new TransactionMessage({
                payerKey: this.#keypair.publicKey,
                recentBlockhash: blockhash,
                instructions: instructions,
            }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);
            const simulatedTx = this.connection.simulateTransaction(transaction);
            const estimatedComputeUnits = (await simulatedTx).value.unitsConsumed;
            const safeComputeUnits = Math.ceil(
                estimatedComputeUnits ? Math.max(estimatedComputeUnits + 100000, estimatedComputeUnits * 1.2) : 200000,
            );
            const computeBudgetLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
                units: safeComputeUnits,
            });

            const priorityFee = await this.connection
                .getRecentPrioritizationFees()
                .then(
                    (fees) =>
                        fees.sort((a, b) => a.prioritizationFee - b.prioritizationFee)[
                            Math.floor(fees.length * this.priorityFeeTiers[feeTier])
                        ].prioritizationFee,
                );

            const computeBudgetPriorityFeeInstructions = ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: priorityFee,
            });

            return {
                blockhash,
                computeBudgetLimitInstruction,
                computeBudgetPriorityFeeInstructions,
            };
        } catch (error) {
            throw new Error(`Failed to get compute budget instructions: ${error}`);
        }
    }
}

export const solana = (params: SolanaKeypairWalletClientCtorParams) => new SolanaKeypairWalletClient(params);
