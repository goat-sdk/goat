import { PluginBase } from "@goat-sdk/core";
import type { Chain, WalletClientBase } from "@goat-sdk/core";
import { YieldSignalService } from "./yieldsignal.service";

/**
 * The x402 client that settles the per-call payment. Any implementation
 * accepted by `@x402/fetch` works — for example `CdpX402Client` from
 * `@coinbase/cdp-sdk/x402`, backed by a funded Base wallet.
 *
 * Typed structurally instead of importing the concrete class so this plugin
 * does not force a specific x402 client (or its dependency tree) on consumers
 * who already have one wired up.
 */
// biome-ignore lint/suspicious/noExplicitAny: structural handoff to @x402/fetch, which owns the real type.
type X402Client = any;

export interface YieldSignalOptions {
    /** Funded x402 client used to pay for each call. */
    x402Client: X402Client;
    /** Override the API base URL. Defaults to the public deployment. */
    baseUrl?: string;
}

/**
 * Paid yield and risk intelligence for lending on Base and liquid staking on
 * Ethereum, delivered over x402 — no API key and no account, the agent's wallet
 * pays per call.
 *
 * Six tools: the raw signal, a MOVE/HOLD decision, and four risk reports
 * (incentive durability, exit capacity, borrow-rate sensitivity, shared
 * exposure). Every response is EIP-712 signed by the payment-receiving address
 * and readings are attested on-chain via EAS, so an agent can verify what it
 * paid for without trusting the server.
 */
export class YieldSignalPlugin extends PluginBase<WalletClientBase> {
    constructor(options: YieldSignalOptions) {
        super("yieldsignal", [new YieldSignalService(options)]);
    }

    /**
     * Supports every chain: payment settles in USDC on Base through the x402
     * client, independently of whatever chain the agent's wallet is pointed at.
     */
    supportsChain = (_chain: Chain) => true;
}

/**
 * Utility factory function for creating a YieldSignalPlugin instance
 */
export function yieldsignal(options: YieldSignalOptions) {
    return new YieldSignalPlugin(options);
}
