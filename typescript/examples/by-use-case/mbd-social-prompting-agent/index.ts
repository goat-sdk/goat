// index.ts
import readline from "node:readline";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { Chain, ToolBase } from "@goat-sdk/core";
import { z } from "zod";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { mbdSocial } from "../../../packages/plugins/mbd";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
require("dotenv").config();

// Extend Chain type declaration
declare module "@goat-sdk/core" {
    interface Chain {
        network?: string;
        nativeCurrency?: {
            name: string;
            symbol: string;
            decimals: number;
        };
        rpcUrls?: {
            default: {
                http: string[];
            };
        };
    }
}

// Implementação corrigida do adaptador EVM
class ViemWalletAdapter extends EVMWalletClient {
    private viemWallet;
    private viemAccount;

    constructor(privateKey: string) {
        super();
        this.viemAccount = privateKeyToAccount(privateKey as `0x${string}`);
        this.viemWallet = createWalletClient({
            account: this.viemAccount,
            transport: http(process.env.RPC_PROVIDER_URL || ""),
            chain: sepolia,
        });
    }

    getAddress(): string {
        return this.viemAccount.address;
    }

    getChain(): Chain {
        return {
            id: sepolia.id,
            type: "radix", // Temporary compatibility fix
            name: sepolia.name,
            network: sepolia.network,
            nativeCurrency: sepolia.nativeCurrency,
            rpcUrls: sepolia.rpcUrls
        };
    }

    async balanceOf(address: string) {
        const balance = await this.viemWallet.getBalance({
            address: address as `0x${string}`
        });

        return {
            value: balance,
            formatted: Number(balance) / 10 ** 18 + "",
            symbol: "ETH",
            decimals: 18,
            name: "Ethereum",
            inBaseUnits: false
        };
    }

    getCoreTools() {
        return [];
    }

    async read(params: any) {
        return { value: null };
    }

    async sendTransaction(params: any) {
        const hash = await this.viemWallet.sendTransaction(params);
        return { hash };
    }

    async resolveAddress(address: string) {
        return address;
    }

    async signMessage(message: string) {
        return this.viemWallet.signMessage({
            account: this.viemAccount,
            message
        });
    }
}

// Main execution
(async () => {
    console.log("🐐 MBD Social Prompting Agent");
    console.log("Initializing services...");

    const walletClient = new ViemWalletAdapter(process.env.WALLET_PRIVATE_KEY || "");

    const tools = await getOnChainTools({
        wallet: walletClient,
        plugins: [
            mbdSocial({
                mbdApiKey: process.env.MBD_API_KEY as string,
                neynarApiKey: process.env.NEYNAR_API_KEY as string
            })
        ]
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("\n✅ System initialized!");
    console.log("\n-------------------");
    console.log("🌟 MBD SOCIAL PROMPTING AGENT");
    console.log("-------------------");
    console.log("Available commands:");
    console.log("- Analyze user [FID]");
    console.log("- Show feed for [FID]");
    console.log("- Find similar to [FID]");
    console.log("- Trends for [FID]");
    console.log("- Content recommendations [FID]");
    console.log("Type 'exit' to quit\n");

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question('\n👤 You: ', resolve);
        });

        if (prompt.toLowerCase() === "exit") {
            console.log("\n👋 Shutting down...");
            rl.close();
            break;
        }

        console.log("\n-------------------");
        console.log("🔄 Processing...");
        console.log("-------------------");

        try {
            const result = await generateText({
                model: openai(process.env.OPENAI_API_KEY || "gpt-4-turbo"),
                tools: tools,
                maxSteps: 8,
                prompt: prompt,
                temperature: 0.7,

                onStepFinish: (event) => {
                    console.log(`\n🔧 Tool Used: ${event.toolName}`);
                    if (event.toolResults) {
                        console.log(`📊 Results: ${JSON.stringify(event.toolResults)}`);
                    }
                },
            });

            console.log("\n-------------------");
            console.log("🤖 Response:");
            console.log("-------------------");
            console.log(result.text);
        } catch (error) {
            console.error("\n❌ Error:", error instanceof Error ? error.message : error);
        }

        console.log("\n-------------------");
    }
})().catch(error => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});