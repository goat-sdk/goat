/**
 * Boson Protocol — AI agent commerce example
 *
 * This example shows an AI agent that can:
 * 1. Query available product offers on Boson Protocol
 * 2. Commit to an offer (purchase) using its own wallet
 * 3. Handle the full exchange lifecycle (redeem, complete, dispute)
 *
 * Chain: Polygon Amoy testnet (80002) — set CHAIN=polygon for mainnet
 *
 * Required env vars:
 *   WALLET_PRIVATE_KEY   — 0x-prefixed private key for a funded Amoy wallet
 *   ANTHROPIC_API_KEY    — Anthropic API key
 *   BOSON_MCP_URL        — (optional) override; defaults to the staging MCP
 *                          (mcp-staging.bosonprotocol.io) so Polygon Amoy works.
 *                          For mainnet flows use https://mcp.bosonprotocol.io/mcp.
 */

import readline from "node:readline";
import { anthropic } from "@ai-sdk/anthropic";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { bosonProtocolPlugin } from "@goat-sdk/plugin-boson";
import { viem } from "@goat-sdk/wallet-viem";
import { type CoreMessage, generateText } from "ai";
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

require("dotenv").config();

// Default to staging because Polygon Amoy (the chain hardcoded below) only lives
// on the staging MCP. For mainnet runs (Base/Optimism/Ethereum), set
// BOSON_MCP_URL=https://mcp.bosonprotocol.io/mcp and pick a matching chain.
const BOSON_MCP_URL = process.env.BOSON_MCP_URL ?? "https://mcp-staging.bosonprotocol.io/mcp";

// 1. Create a wallet client for Polygon Amoy testnet
const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account,
    transport: http(),
    chain: polygonAmoy,
});

(async () => {
    // 2. Get on-chain tools including the Boson plugin
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [bosonProtocolPlugin({ url: BOSON_MCP_URL })],
    });

    const systemPrompt = `You are an AI agent with access to Boson Protocol, a trust-minimized commerce platform for physical goods.

You can:
- Query product offers with boson_get_offers
- Commit to (purchase) an offer with boson_commit_to_offer
- Check exchange status with boson_get_exchanges
- Redeem a voucher with boson_redeem_voucher
- Complete an exchange with boson_complete_exchange
- Raise a dispute with boson_raise_dispute if something goes wrong

Always call boson_get_config_ids first to discover the available deployment (use 'testing-80002-0' for testnet).

When committing to an offer, your wallet address is the buyer address. Use get_address to find it.

Before committing, always:
1. Check available offers and confirm the price with the user
2. Check token approval with boson_approve_exchange_token if the payment token is not native MATIC
3. Confirm the user wants to proceed`;

    const messages: CoreMessage[] = [];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("Boson Protocol AI Agent ready. Type 'exit' to quit.\n");
    console.log(`Wallet: ${account.address}`);
    console.log("Chain: Polygon Amoy (80002)\n");

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question("You: ", resolve);
        });

        if (prompt === "exit") {
            rl.close();
            break;
        }

        messages.push({ role: "user", content: prompt });

        try {
            const result = await generateText({
                model: anthropic("claude-sonnet-4-6"),
                system: systemPrompt,
                messages,
                tools,
                maxSteps: 10,
                onStepFinish: (event) => {
                    if (event.toolResults.length > 0) {
                        console.log("\n[Tool calls]", JSON.stringify(event.toolResults, null, 2));
                    }
                },
            });

            messages.push({ role: "assistant", content: result.text });
            console.log(`\nAgent: ${result.text}\n`);
        } catch (error) {
            console.error("Error:", error);
        }
    }
})();
