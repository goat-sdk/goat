import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { GetQuoteParameters, SwapParameters } from "./parameters";

type Tx = { chainId: number; to: string; data: string; value: string };
type Quote = {
    id: string;
    provider: string;
    toAmount: string;
    toAmountMin: string;
    gasUsd: number;
    feeUsd: number;
    netUsd: number | null;
    etaSeconds: number;
    expiresAt: number;
    execution?: "tx" | "order";
};
type QuotesResponse = { quotes: Quote[]; best: string | null; errors: { provider: string; message: string }[] };
type BuildResponse = Tx & { approval?: Tx; permit2?: unknown; execution?: string };

export type SwapChanOptions = {
    /** SwapChan partner id. Swaps routed with it earn the partner 5 bp. Register at https://swapchan.com/partners */
    partnerId?: string;
    baseUrl?: string;
    apiKey?: string;
};

export class SwapChanService {
    private readonly baseUrl: string;

    constructor(private readonly options: SwapChanOptions = {}) {
        this.baseUrl = (options.baseUrl ?? "https://api.swapchan.com").replace(/\/$/, "");
    }

    private async request<T>(path: string, body?: unknown): Promise<T> {
        const headers: Record<string, string> = { accept: "application/json" };
        if (body !== undefined) headers["content-type"] = "application/json";
        if (this.options.apiKey) headers["x-api-key"] = this.options.apiKey;
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: body === undefined ? "GET" : "POST",
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(
                `SwapChan ${path.split("?")[0]} failed (${response.status}): ${json?.error ?? "unknown error"}`,
            );
        }
        return json as T;
    }

    private quotes(walletClient: EVMWalletClient, p: GetQuoteParameters) {
        const fromChainId = walletClient.getChain().id;
        const q = new URLSearchParams();
        const entries = {
            fromChainId,
            toChainId: p.toChainId ?? fromChainId,
            fromToken: p.fromToken,
            toToken: p.toToken,
            amount: p.amount,
            slippageBps: p.slippageBps ?? 50,
            fromAddress: walletClient.getAddress(),
            toAddress: p.toAddress,
            partner: this.options.partnerId,
        };
        for (const [k, v] of Object.entries(entries)) if (v !== undefined && v !== "") q.set(k, String(v));
        return this.request<QuotesResponse>(`/quotes?${q}`);
    }

    @Tool({
        name: "swapchan_get_quote",
        description:
            "Compare same-chain or cross-chain swap routes across Jupiter, 0x, CoW, LI.FI, Relay, KyberSwap, Velora, Across, deBridge and THORChain via SwapChan. Returns all routes ranked best-first by net output (after gas and fees). Read-only.",
    })
    async getQuote(walletClient: EVMWalletClient, parameters: GetQuoteParameters) {
        const r = await this.quotes(walletClient, parameters);
        return {
            best: r.best,
            quotes: r.quotes.slice(0, 5).map((q) => ({
                id: q.id,
                provider: q.provider,
                toAmount: q.toAmount,
                toAmountMin: q.toAmountMin,
                gasUsd: q.gasUsd,
                feeUsd: q.feeUsd,
                etaSeconds: q.etaSeconds,
            })),
            errors: r.errors,
        };
    }

    @Tool({
        name: "swapchan_swap",
        description:
            "Swap or bridge tokens from the connected EVM wallet at the best price found by SwapChan. Sends an ERC-20 approval first if needed, then the swap transaction. Returns the transaction hash.",
    })
    async swap(walletClient: EVMWalletClient, parameters: SwapParameters) {
        const r = await this.quotes(walletClient, parameters);
        // Signed-order routes (e.g. CoW) and Permit2 flows need an off-chain signature; use the best plain-tx route.
        for (const quote of r.quotes) {
            if (quote.execution === "order") continue;
            const built = await this.request<BuildResponse>("/build", {
                quoteId: quote.id,
                taker: walletClient.getAddress(),
                ...(parameters.toAddress ? { recipient: parameters.toAddress } : {}),
            });
            if (built.permit2 || (built.execution && built.execution !== "tx")) continue;
            if (built.approval) {
                await walletClient.sendTransaction({
                    to: built.approval.to,
                    data: built.approval.data as `0x${string}`,
                    value: BigInt(built.approval.value || "0"),
                });
            }
            const tx = await walletClient.sendTransaction({
                to: built.to,
                data: built.data as `0x${string}`,
                value: BigInt(built.value || "0"),
            });
            return {
                hash: tx.hash,
                provider: quote.provider,
                toAmount: quote.toAmount,
                toAmountMin: quote.toAmountMin,
                statusCheck: `${this.baseUrl}/status?provider=${quote.provider}&txHash=${tx.hash}&fromChainId=${walletClient.getChain().id}&toChainId=${parameters.toChainId ?? walletClient.getChain().id}`,
            };
        }
        throw new Error(
            `SwapChan found no executable route${r.errors.length ? `: ${r.errors.map((e) => `${e.provider}: ${e.message}`).join("; ")}` : ""}`,
        );
    }
}
