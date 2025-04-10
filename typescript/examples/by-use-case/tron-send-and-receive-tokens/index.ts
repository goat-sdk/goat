import readline from "node:readline";
import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { WalletClientBase } from "@goat-sdk/core";
import { sendTRX } from "@goat-sdk/wallet-tron";
import { tron } from "@goat-sdk/wallet-tron";
import { generateText } from "ai";
import dotenv from "dotenv";
import { TronWeb } from "tronweb";

dotenv.config();

const fullNode: string = process.env.TRON_FULL_NODE || "https://nile.trongrid.io";
const solidityNode: string = process.env.TRON_SOLIDITY_NODE || "https://nile.trongrid.io";
const eventServer: string = process.env.TRON_EVENT_SERVER || "https://nile.trongrid.io";

const tronWeb: TronWeb = new TronWeb(fullNode, solidityNode, eventServer);

const privateKey: string = process.env.TRON_PRIVATE_KEY as string;
if (!privateKey || privateKey.length !== 64) {
    throw new Error("Invalid TRON private key.");
}
tronWeb.setPrivateKey(privateKey);
const maybeAddress: string | false = tronWeb.address.fromPrivateKey(privateKey);
if (!maybeAddress) {
    throw new Error("Failed to derive a valid Tron address from the provided private key.");
}
const address: string = maybeAddress;

const wallet = tron({ tronWeb, address, privateKey }) as unknown as WalletClientBase;

async function chat(): Promise<void> {
    const tools = await getOnChainTools({
        wallet,
        plugins: [sendTRX()],
    });

    type Message = {
        role: "user" | "assistant";
        content: string;
    };

    console.log("Chat started. Type 'exit' to end the conversation.");

    const conversationHistory: Message[] = [];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = (): void => {
        rl.question("You: ", async (prompt: string) => {
            if (prompt.toLowerCase() === "exit") {
                rl.close();
                return;
            }

            conversationHistory.push({ role: "user", content: prompt });

            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools, // Agus, Here is an issue.
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: `You are a based crypto degen assistant. You're knowledgeable about DeFi, NFTs, and trading. You use crypto slang naturally and stay up to date with the Tron ecosystem. You help users with their trades and provide market insights. Keep responses concise and use emojis occasionally.

Previous conversation:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n")}

Current request: ${prompt}`,
                onStepFinish: (event) => {
                    console.log("Tool execution:", event.toolResults);
                },
            });

            conversationHistory.push({ role: "assistant", content: result.text });
            console.log("Assistant:", result.text);
            askQuestion();
        });
    };

    askQuestion();
}

chat().catch(console.error);
