import { type Chain, PluginBase, type WalletClientBase, createTool } from "@goat-sdk/core";
import { SpendPreflightApi, type SpendPreflightOptions } from "./api";
import { checkParameters, preflightParameters } from "./parameters";

export class SpendPreflightPlugin extends PluginBase {
    private readonly api: SpendPreflightApi;
    constructor(options: SpendPreflightOptions = {}) {
        super("spendpreflight", []);
        this.api = new SpendPreflightApi(options);
    }
    supportsChain(_chain: Chain): boolean {
        return true;
    }
    getTools(_walletClient: WalletClientBase) {
        return [
            createTool(
                {
                    name: "spendpreflight_check_payee",
                    description:
                        "Before paying an unfamiliar payee, screen their wallet/name against OFAC SDN and inspect merchant domain age/DNS. Operated by SpendPreflight. $0.01 per screening in Base USDC, shared free trial available. Read-only; never pays the merchant. Informational, not a compliance certification. Use preflight_payment for an allow/hold/block spending decision.",
                    parameters: checkParameters,
                },
                (parameters) => this.api.checkPayee(parameters),
            ),
            createTool(
                {
                    name: "spendpreflight_preflight_payment",
                    description:
                        "Before paying an x402 challenge or cart, obtain allow/hold/block with reasons and a receipt. Operated by SpendPreflight. $0.02 per screening in Base USDC, shared free trial available. This tool never pays the merchant or enforces your wallet: pay only on allow; hold asks a human; block or tool failure means do not pay.",
                    parameters: preflightParameters,
                },
                (parameters) => this.api.preflightPayment(parameters),
            ),
        ];
    }
}

export const spendpreflight = (options: SpendPreflightOptions = {}) => new SpendPreflightPlugin(options);
