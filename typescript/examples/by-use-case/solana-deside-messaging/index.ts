import { ToolBase, getTools } from "@goat-sdk/core";
import { deside } from "@goat-sdk/plugin-deside";
import { solana } from "@goat-sdk/wallet-solana";
import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

function readRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

async function main() {
    const connection = new Connection(readRequiredEnv("SOLANA_RPC_URL"));
    const keypair = Keypair.fromSecretKey(base58.decode(readRequiredEnv("SOLANA_PRIVATE_KEY")));
    const wallet = solana({
        keypair,
        connection,
    });

    const tools = await getTools({
        wallet,
        plugins: [
            deside({
                baseUrl: process.env.DESIDE_BASE_URL || "https://mcp.deside.io",
                mcpPath: process.env.DESIDE_MCP_PATH || "/mcp",
                oauthClientName: process.env.DESIDE_OAUTH_CLIENT_NAME || "goat-deside-example",
                oauthRedirectUri: readRequiredEnv("DESIDE_OAUTH_REDIRECT_URI"),
                signatureEncoding: (process.env.DESIDE_SIGNATURE_ENCODING || "auto") as
                    | "auto"
                    | "base58"
                    | "hex"
                    | "base64",
            }),
        ],
    });

    const getIdentityTool = tools.find((tool: ToolBase) => tool.name === "deside_get_my_identity");
    const listConversationsTool = tools.find((tool: ToolBase) => tool.name === "deside_list_conversations");
    const sendDmTool = tools.find((tool: ToolBase) => tool.name === "deside_send_dm");

    if (!getIdentityTool || !listConversationsTool || !sendDmTool) {
        throw new Error(
            `Expected Deside tools were not loaded. Got: ${tools.map((tool: ToolBase) => tool.name).join(", ")}`,
        );
    }

    const listLimit = Number.parseInt(process.env.DESIDE_LIST_LIMIT || "10", 10);
    const summary: Record<string, unknown> = {
        wallet: wallet.getAddress(),
        toolNames: tools.map((tool: ToolBase) => tool.name),
        identity: await getIdentityTool.execute({}),
        conversations: await listConversationsTool.execute({ limit: listLimit }),
        send: null,
    };

    if (process.env.DESIDE_TO_WALLET) {
        summary.send = await sendDmTool.execute({
            to_wallet: process.env.DESIDE_TO_WALLET,
            text: process.env.DESIDE_TEXT || `Hello from GOAT Deside example @ ${new Date().toISOString()}`,
        });
    }

    console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
