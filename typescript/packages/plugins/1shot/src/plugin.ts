import { PluginBase, ToolBase, WalletClientBase, createTool } from "@goat-sdk/core";
import { OneShotClient, SolidityStructParam, Transaction } from "@uxly/1shot-client";
import { TransactionService } from "./transactionService.js";

export class OneShotPlugin extends PluginBase {
    protected transactionService: TransactionService;

    constructor(
        protected readonly client: OneShotClient,
        protected readonly businessId: string,
    ) {
        const transactionService = new TransactionService(client, businessId);
        super("1shot", [transactionService]);
        
        this.transactionService = transactionService;
    }

    supportsChain = () => true;

    /**
     * Get a list of tools from the client
     * This is overridden because 1Shot tools are dynamic. It does mean that we can't easily use the
     * @Tool decorator on the methods in the TransactionService class.
     * @returns A list of tools
     */
    public async getTools(walletClient: WalletClientBase): Promise<ToolBase[]> {
        // Start with the tools from the base class, using the @Tool decorator
        const tools = await super.getTools(walletClient);

        tools.push(...(await this.transactionService.getTools()));

        return tools;
    }
}

export function oneshot(apiKey: string, apiSecret: string, businessId: string) {
    const client = new OneShotClient({ apiKey, apiSecret });
    return new OneShotPlugin(client, businessId);
}
