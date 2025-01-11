import { getTools } from "../utils";
import { PluginBase } from "./PluginBase";
import { ToolBase } from "./ToolBase";
import { WalletClientBase } from "./WalletClientBase";

type TAdapterParams = {
    wallet: WalletClientBase;
    plugins: PluginBase<WalletClientBase>[];
};

export abstract class AdapterBase<TAdaptedTool> {
    private params: TAdapterParams;

    constructor(params: TAdapterParams) {
        this.params = params;
    }

    /**
     * Get all the converted tools for the target framework
     *
     * @returns A list of tools adapted for the target framework
     */
    public async getAdaptedTools(): Promise<TAdaptedTool[]> {
        const tools = await getTools({
            wallet: this.params.wallet,
            plugins: this.params.plugins,
        });

        return tools.map((tool: ToolBase) => this.adaptTool(tool));
    }

    /**
     * Converts a tool for it to be usable with the target framework
     *
     * @param tool
     * @returns A tool adapted for the target framework
     */
    protected abstract adaptTool(tool: ToolBase): TAdaptedTool;
}
