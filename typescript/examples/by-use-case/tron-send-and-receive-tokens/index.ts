import readline from "node:readline";
import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { sendTRX, tron } from "@goat-sdk/wallet-tron";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

// 1. Create the wallet client using the Tron factory function.
// Ensure your .env file includes a TRON_PRIVATE_KEY variable.
const privateKey = process.env.TRON_PRIVATE_KEY as string;
if (!privateKey) {
    throw new Error("Please define TRON_PRIVATE_KEY in your .env file");
}
const wallet = tron(privateKey);

async function chat() {
    // 2. Get the on-chain tools for the wallet.
    const tools = await getOnChainTools({
        wallet,
        plugins: [
            sendTRX(), // Enable TRX transfers.
        ],
    });

    // 3. Create a readline interface to interact with the agent.
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

    const askQuestion = () => {
        rl.question("You: ", async (prompt) => {
            if (prompt.toLowerCase() === "exit") {
                rl.close();
                return;
            }
            conversationHistory.push({ role: "user", content: prompt });

            const result = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10, // Maximum number of tool invocations per request.
                prompt: `You are a crypto degen assistant knowledgeable about TRON and DeFi. 
You help users send TRX and provide market insights. 
Keep responses concise and use crypto slang.

Previous conversation:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n")}

Current request: ${prompt}`,
                onStepFinish: (event) => {
                    console.log("Tool execution:", event.toolResults);
                },
            });

            conversationHistory.push({
                role: "assistant",
                content: result.text,
            });
            console.log("Assistant:", result.text);
            askQuestion();
        });
    };

    askQuestion();
}

chat().catch(console.error);
