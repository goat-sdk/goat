import { Tool } from "@goat-sdk/core";
import {
    CheckBr35kStatusParameters,
    CheckTaxImpactParameters,
    CompareBorrowVsSellParameters,
} from "./parameters";
import type { TaxRailPluginConfig } from "./taxrail.plugin";

const DEFAULT_BASE_URL = "https://api.taxrail.online";

export class TaxRailService {
    private readonly baseUrl: string;
    private readonly referrerWallet?: string;

    constructor(config: TaxRailPluginConfig = {}) {
        this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
        this.referrerWallet = config.referrerWallet;
    }

    private async postJson(path: string, body: Record<string, unknown>) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(this.referrerWallet ? { "X-TaxRail-Referrer": this.referrerWallet } : {}),
            },
            body: JSON.stringify({
                ...body,
                ...(this.referrerWallet ? { referrerWallet: this.referrerWallet } : {}),
            }),
        });
        if (!response.ok) {
            throw new Error(`TaxRail HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
    }

    @Tool({
        name: "taxrail_check_tax_impact",
        description:
            "Simulate crypto disposal taxes BEFORE swapping (FREE). Compares naive FIFO vs SpecID/HIFO and returns taxSavedUsd + unlockable planId.",
    })
    async checkTaxImpact(parameters: CheckTaxImpactParameters) {
        return this.postJson("/api/v1/check-tax-impact", {
            jurisdiction: parameters.jurisdiction,
            regime: parameters.jurisdiction === "BR" ? "PF_LEI_14754" : "INDIVIDUAL",
            chain: parameters.chain,
            targetAsset: parameters.targetAsset,
            sellQuantity: parameters.sellQuantity,
            walletAddress: parameters.walletAddress,
        });
    }

    @Tool({
        name: "taxrail_compare_borrow_vs_sell",
        description:
            "Compare capital gains tax from selling appreciated crypto vs borrowing USDC on Aave v3 (FREE). Returns recommendation + unlockable planId.",
    })
    async compareBorrowVsSell(parameters: CompareBorrowVsSellParameters) {
        return this.postJson("/api/v1/borrow-vs-sell", {
            ...parameters,
            regime: parameters.jurisdiction === "BR" ? "PF_LEI_14754" : "INDIVIDUAL",
        });
    }

    @Tool({
        name: "taxrail_check_br_35k_status",
        description:
            "Check Brazil R$35,000 monthly crypto tax-exemption headroom vs Lei 14.754 15% flat rate ($0.005 USDC via x402 on Base).",
    })
    async checkBr35kStatus(parameters: CheckBr35kStatusParameters) {
        const query = new URLSearchParams({
            monthlySalesBrl: String(parameters.monthlySalesBrl),
            plannedSaleUsd: String(parameters.plannedSaleUsd),
            custodyLocation: parameters.custodyLocation,
        });
        const response = await fetch(`${this.baseUrl}/api/v1/x402/br-35k-status?${query.toString()}`, {
            method: "GET",
            headers: {
                ...(parameters.paymentSignature
                    ? { "PAYMENT-SIGNATURE": parameters.paymentSignature }
                    : {}),
                ...(this.referrerWallet ? { "X-TaxRail-Referrer": this.referrerWallet } : {}),
            },
        });
        const data = await response.json();
        if (response.status === 402) {
            return { status: 402, paymentRequired: data };
        }
        if (!response.ok) {
            throw new Error(`TaxRail HTTP ${response.status}`);
        }
        return data;
    }
}
