import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import {
    PromptInjectionParameters,
    ScamMessageParameters,
    TokenPrecheckParameters,
    TokenVerdictParameters,
} from "./parameters";
import { paidPost } from "./x402";

const BASE_URL = "https://agentsvc.io/api/v1/proxy";

export class AgentsvcService {
    constructor(private readonly maxPaymentUsdc: number) {}

    @Tool({
        name: "agentsvc_token_precheck",
        description:
            "Check one to five tokens right before a swap and get ALLOW, CAUTION or BLOCK for each, with grade A to F and the main reason (honeypot, sell tax, owner powers, liquidity, age). Results are cached for 10 minutes so repeat checks are fast. Costs 0.004 USDC per call, paid from the wallet in USDC via x402 (agentsvc.io). Never buy a token marked BLOCK.",
    })
    async tokenPrecheck(walletClient: EVMWalletClient, parameters: TokenPrecheckParameters) {
        return this.call(walletClient, "token-precheck", parameters);
    }

    @Tool({
        name: "agentsvc_token_verdict",
        description:
            "Full verdict for one token: grade A to F, score, one-line reason, key facts (liquidity, age, holders, taxes) and a shareable link. Based on a real buy and sell simulation and contract checks on base, ethereum, bsc, arbitrum, polygon, avalanche, optimism or solana. Costs 0.009 USDC per call, paid from the wallet via x402 (agentsvc.io).",
    })
    async tokenVerdict(walletClient: EVMWalletClient, parameters: TokenVerdictParameters) {
        return this.call(walletClient, "token-verdict", parameters);
    }

    @Tool({
        name: "agentsvc_scam_message_check",
        description:
            "Check a message for scams and phishing before acting on it: verdict safe, suspicious or scam, scam type (wallet drainer, fake airdrop, impersonation, seed phrase theft and more), red flags with quotes. Every link is checked for domain age and look-alike domains. Costs 0.003 USDC per call, paid via x402 (agentsvc.io).",
    })
    async scamMessageCheck(walletClient: EVMWalletClient, parameters: ScamMessageParameters) {
        return this.call(walletClient, "scam-message-check", parameters);
    }

    @Tool({
        name: "agentsvc_prompt_injection_check",
        description:
            "Check untrusted text (web page, email, tool output) for prompt injection before the agent reads it: verdict safe, suspicious or malicious, techniques found and exact quotes. Costs 0.004 USDC per call, paid via x402 (agentsvc.io).",
    })
    async promptInjectionCheck(walletClient: EVMWalletClient, parameters: PromptInjectionParameters) {
        return this.call(walletClient, "prompt-injection-check", parameters);
    }

    private async call(walletClient: EVMWalletClient, slug: string, body: object) {
        return paidPost(walletClient, `${BASE_URL}/${slug}`, body, this.maxPaymentUsdc);
    }
}
