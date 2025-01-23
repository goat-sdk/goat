import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { CoreTool, generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { Token, erc20 } from "@goat-sdk/plugin-erc20";

import { curves } from "@goat-sdk/plugin-curves";
import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

import { default as formTestnet } from "./formt.testnet";

require("dotenv").config();

type FunctionTool = CoreTool & {
    type?: "function";
    description?: string;
};

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: formTestnet,
});

(async () => {
    // Declare WETH token on testnet
    const WETH: Token = {
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        chains: {
            [132902]: {
                contractAddress: "0xA65be6D7DE4A82Cc9638FB3Dbf8E68b7f2e757ab",
            },
        },
    };

    // Declare USDC token on testnet
    const USDC: Token = {
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
        chains: {
            [132902]: {
                contractAddress: "0xaC96dbABb398ee0c49660049590a6e5527Ae581F",
            },
        },
    };

    //  Load Form tools
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            curves(), // Add Curves plugin with all tools
            sendETH(), // Add sendETH plugin for compatibilty showcase
            erc20({
                tokens: [WETH, USDC],
            }), // Add erc20 plugin for compatibilty showcase
        ],
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const log = {
        header: (text: string) => console.log(`\n🌟 ${text.toUpperCase()} 🌟\n`),
        section: (text: string) => console.log(`\n📍 ${text}\n`),
        info: (text: string) => console.log(`  ℹ️  ${text}`),
        success: (text: string) => console.log(`  ✅ ${text}`),
        warning: (text: string) => console.log(`  ⚠️  ${text}`),
        error: (text: string, e?: Error) => {
            console.error(`  ❌ ${text}`);

            // Parse and simplify the error message
            if (e?.message) {
                const errorMessage = e.message.toLowerCase();

                // Common error cases
                if (errorMessage.includes("execution reverted")) {
                    log.warning("Transaction was rejected by the network. Possible reasons:");
                    log.list([
                        "Insufficient balance",
                        "You don't own the tokens you're trying to sell",
                        "Contract restrictions prevent this operation",
                    ]);
                } else if (errorMessage.includes("insufficient funds")) {
                    log.warning("You don't have enough funds for this transaction");
                } else {
                    // For unknown errors, show a simplified message
                    console.error(`     Reason: ${e.message.split("Raw Call Arguments")[0].trim()}`);
                }
            }
        },
        list: (items: string[]) => {
            for (const item of items) {
                console.log(`  • ${item}`);
            }
        },
        step: (num: number, text: string) => console.log(`\n→ Step ${num}: ${text}`),
        result: (text: string) => console.log(`     ${text}`),
        spacer: () => console.log(""),
    };

    // Usage in your code:
    log.header("Form Curves CLI");
    log.section("Available Tools");
    log.list(
        Object.values(tools)
            .filter((t) => (t.type === undefined || t.type === "function") && "description" in t)
            .map((t) => (t as FunctionTool).description || "No description available"),
    );
    while (true) {
        log.spacer();
        const prompt = await new Promise<string>((resolve) => {
            rl.question('💭 What would you like to do? (type "exit" to quit): ', resolve);
        });

        if (prompt === "exit") {
            log.info("Thanks for using Form Curves CLI!");
            rl.close();
            break;
        }

        log.section("Processing Your Request");

        try {
            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools,
                maxSteps: 10,
                prompt,
                onStepFinish: (event) => {
                    if (event.toolResults) {
                        event.toolResults.forEach((result, index) => {
                            log.info(`tool_call[${index + 1}]: ${JSON.stringify(result)}`);
                        });
                    }
                },
            });
            log.spacer();
            log.success(result.text.replace(/`/g, "")); // Remove backticks for cleaner output
        } catch (error) {
            log.error("Sorry, there was a problem with your request", error as Error);
        }
    }
})();
