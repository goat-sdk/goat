import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { BuyParameters, EmptyParameters, GetHeatParameters, SellParameters } from "./parameters";

const API = "https://trnch.fun/api/bot/v1";

type BuiltSwap = {
    router: string;
    approval: { to: string; data: `0x${string}` } | null;
    tx: { to: string; data: `0x${string}`; value?: string };
};

export class TrnchService {
    private apiKey: string | undefined;

    constructor(
        apiKey?: string,
        private readonly ref?: string,
    ) {
        this.apiKey = apiKey;
    }

    private async request(path: string, init: RequestInit = {}, key?: string) {
        const headers: Record<string, string> = { "content-type": "application/json" };
        if (key) headers.authorization = `Bearer ${key}`;
        const response = await fetch(`${API}${path}`, { ...init, headers });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(`TRNCH ${path} ${response.status}: ${body.error ?? response.statusText}`);
        return body;
    }

    // No key given: create one by signing a message with the agent wallet (no funds move).
    private async key(walletClient: EVMWalletClient): Promise<string> {
        if (this.apiKey) return this.apiKey;
        const wallet = walletClient.getAddress();
        const { message } = await this.request(`/register?wallet=${wallet}`);
        const { signature } = await walletClient.signMessage(message);
        const reg = await this.request("/register", {
            method: "POST",
            body: JSON.stringify({ wallet, message, signature, label: "goat", ...(this.ref ? { ref: this.ref } : {}) }),
        });
        this.apiKey = reg.key as string;
        return this.apiKey;
    }

    private async execute(walletClient: EVMWalletClient, built: BuiltSwap, key: string) {
        if (built.approval) await walletClient.sendTransaction({ to: built.approval.to, data: built.approval.data });
        const { hash } = await walletClient.sendTransaction({
            to: built.tx.to,
            data: built.tx.data,
            value: BigInt(built.tx.value ?? 0),
        });
        await this.request("/confirm", { method: "POST", body: JSON.stringify({ txHash: hash }) }, key).catch(
            () => undefined,
        );
        return { hash, router: built.router };
    }

    @Tool({
        name: "trnch_get_stats",
        description:
            "Get TRNCH live numbers for the last 24 hours: tokens spotted on Robinhood Chain, tokens kept out as High risk by TIA, rugs detected, median detection delay and the bot fee. No key needed.",
    })
    async getStats(_walletClient: EVMWalletClient, _parameters: EmptyParameters) {
        return this.request("/stats");
    }

    @Tool({
        name: "trnch_get_heat",
        description:
            "Get the TRNCH Heat: new Robinhood Chain tokens screened by TIA (rugs, honeypots, scam contracts, heavy sell taxes and copycats kept out), ranked live. Each token has an opaque id to pass to trnch_buy or trnch_sell, with price, liquidity, volume and price changes. The new list holds just-spotted tokens, not yet screened.",
    })
    async getHeat(walletClient: EVMWalletClient, parameters: GetHeatParameters) {
        const key = await this.key(walletClient);
        const since = parameters.since ? `?since=${encodeURIComponent(parameters.since)}` : "";
        return this.request(`/heat${since}`, {}, key);
    }

    @Tool({
        name: "trnch_buy",
        description:
            "Buy a Robinhood Chain token through TRNCH with USDG: quotes six routers (KyberSwap, LI.FI, Uniswap, 0x, SushiSwap, 1inch), sends the approval if needed and the swap from this wallet, and returns the transaction hash. Tokens kept out by TIA are refused. 0.5% fee, already deducted from the quote.",
    })
    async buy(walletClient: EVMWalletClient, parameters: BuyParameters) {
        const key = await this.key(walletClient);
        const built = (await this.request(
            "/buy",
            { method: "POST", body: JSON.stringify(parameters) },
            key,
        )) as BuiltSwap;
        return this.execute(walletClient, built, key);
    }

    @Tool({
        name: "trnch_sell",
        description:
            "Sell a Robinhood Chain token for USDG through TRNCH: a percent of this wallet's balance, best route across six routers, approval and swap sent from this wallet. Returns the transaction hash. 0.5% fee, already deducted from the quote.",
    })
    async sell(walletClient: EVMWalletClient, parameters: SellParameters) {
        const key = await this.key(walletClient);
        const built = (await this.request(
            "/sell",
            { method: "POST", body: JSON.stringify(parameters) },
            key,
        )) as BuiltSwap;
        return this.execute(walletClient, built, key);
    }
}
