import { PluginBase } from "@goat-sdk/core";
import { BlockRunService } from "./blockrun.service";

export interface BlockRunPluginOptions {
    /**
     * Private key for signing x402 payments (hex string starting with 0x)
     * The key is used locally for signing and never transmitted.
     */
    privateKey: `0x${string}`;

    /**
     * Base URL for BlockRun API
     * @default "https://blockrun.ai/api"
     */
    baseUrl?: string;
}

export class BlockRunPlugin extends PluginBase {
    constructor(opts: BlockRunPluginOptions) {
        super("blockrun", [new BlockRunService(opts)]);
    }

    supportsChain = () => true;
}

/**
 * Create a BlockRun plugin instance for accessing AI models via x402 USDC payments.
 *
 * BlockRun provides:
 * - Access to 31+ AI models (GPT-4, Claude, Gemini, etc.)
 * - Pay-per-use with USDC micropayments on Base (x402 protocol)
 * - No API keys needed - agents pay directly with their wallet
 * - OpenAI-compatible API
 *
 * @param options.privateKey - Wallet private key for signing payments (never transmitted)
 * @param options.baseUrl - Optional custom API URL
 *
 * @example
 * ```typescript
 * import { blockrun } from "@goat-sdk/plugin-blockrun";
 *
 * const tools = await getOnChainTools({
 *     wallet: myWallet,
 *     plugins: [
 *         blockrun({
 *             privateKey: process.env.PRIVATE_KEY as `0x${string}`,
 *         }),
 *     ],
 * });
 * ```
 */
export function blockrun(options: BlockRunPluginOptions) {
    return new BlockRunPlugin(options);
}
