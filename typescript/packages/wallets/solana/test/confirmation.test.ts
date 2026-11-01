import {
    Connection,
    Keypair,
    SendTransactionError,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SolanaKeypairWalletClient } from "../src/SolanaKeypairWalletClient";

describe("Solana keypair transaction confirmation", () => {
    const payer = Keypair.generate();
    const recipient = Keypair.generate().publicKey;
    const blockhash = Keypair.generate().publicKey.toBase58();
    const signature = "submitted-signature";
    let connection: Connection;
    let wallet: SolanaKeypairWalletClient;

    beforeEach(() => {
        connection = new Connection("http://127.0.0.1:8899");
        vi.spyOn(connection, "getLatestBlockhash").mockResolvedValue({
            blockhash,
            lastValidBlockHeight: 100,
        });
        vi.spyOn(connection, "getMultipleAccountsInfo").mockResolvedValue([]);
        vi.spyOn(connection, "sendTransaction").mockResolvedValue(signature);
        vi.spyOn(connection, "confirmTransaction").mockResolvedValue({
            context: { slot: 42 },
            value: { err: null },
        });
        wallet = new SolanaKeypairWalletClient({ connection, keypair: payer });
    });

    afterEach(() => vi.restoreAllMocks());

    function send(kind: "instructions" | "raw" | "SOL") {
        const instruction = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: recipient,
            lamports: 10,
        });
        if (kind === "SOL")
            return wallet.sendToken({
                recipient: recipient.toBase58(),
                baseUnitsAmount: "10",
            });
        if (kind === "instructions") return wallet.sendTransaction({ instructions: [instruction] });
        const transaction = new VersionedTransaction(
            new TransactionMessage({
                payerKey: payer.publicKey,
                recentBlockhash: blockhash,
                instructions: [instruction],
            }).compileToV0Message(),
        );
        return wallet.sendRawTransaction(Buffer.from(transaction.serialize()).toString("base64"));
    }

    describe.each(["instructions", "raw", "SOL"] as const)("%s", (kind) => {
        it("returns the signature after a successful confirmation", async () => {
            await expect(send(kind)).resolves.toEqual({ hash: signature });
        });

        it("rejects a returned execution error with its signature and details", async () => {
            const err = { InstructionError: [0, { Custom: 1 }] };
            vi.mocked(connection.confirmTransaction).mockResolvedValueOnce({
                context: { slot: 42 },
                value: { err },
            });
            const result = send(kind);
            await expect(result).rejects.toBeInstanceOf(SendTransactionError);
            await expect(result).rejects.toThrow(signature);
            await expect(result).rejects.toThrow(JSON.stringify(err));
        });

        it("preserves confirmation rejections", async () => {
            const error = new Error("confirmation unavailable");
            vi.mocked(connection.confirmTransaction).mockRejectedValueOnce(error);
            await expect(send(kind)).rejects.toBe(error);
        });

        it("preserves submission failures", async () => {
            const error = new Error("submission rejected");
            vi.mocked(connection.sendTransaction).mockRejectedValueOnce(error);
            await expect(send(kind)).rejects.toBe(error);
        });
    });
});
