import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import { MODE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { kim } from "@goat-sdk/plugin-kim";

import { getOnChainTools } from "@goat-sdk/adapter-model-context-protocol";
import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

const server = new Server(
    {
        name: "goat",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

// Initialize tools once
const toolsPromise = getOnChainTools({
    wallet: viem(walletClient),
    plugins: [sendETH(), erc20({ tokens: [USDC, MODE] }), kim()],
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    const { listOfTools } = await toolsPromise;
    return {
        tools: listOfTools(),
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { toolHandler } = await toolsPromise;
    try {
        return toolHandler(request.params.name, request.params.arguments);
    } catch (error) {
        throw new Error(`Tool ${name} failed: ${error}`);
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GOAT MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
