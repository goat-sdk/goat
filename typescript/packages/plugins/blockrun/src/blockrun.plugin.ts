import { PluginBase } from "@goat-sdk/core";
import { BlockRunService } from "./blockrun.service";

export interface BlockRunPluginOptions {
    /**
     * Base URL for BlockRun API
     * @default "https://blockrun.ai/api/v1"
     */
    baseUrl?: string;
}

export class BlockRunPlugin extends PluginBase {
    constructor(opts: BlockRunPluginOptions = {}) {
        super("blockrun", [new BlockRunService(opts)]);
    }

    supportsChain = () => true;
}

/**
 * Create a BlockRun plugin instance for accessing AI models via x402 USDC payments.
 *
 * BlockRun provides:
 * - Access to 31+ AI models (GPT-4, Claude, Gemini, etc.)
 * - Pay-per-use with USDC micropayments (x402 protocol)
 * - No API keys needed - agents pay directly
 * - OpenAI-compatible API
 *
 * @example
 * ```typescript
 * import { blockrun } from "@goat-sdk/plugin-blockrun";
 *
 * const tools = await getOnChainTools({
 *     wallet: myWallet,
 *     plugins: [blockrun()],
 * });
 * ```
 */
export function blockrun(options: BlockRunPluginOptions = {}) {
    return new BlockRunPlugin(options);
}
