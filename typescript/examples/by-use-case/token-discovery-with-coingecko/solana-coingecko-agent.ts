import readline from "node:readline";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { config } from "dotenv";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { getOnChainTools } from "@goat-sdk/adapter-langchain";
import { coinGeckoTokenDiscovery } from "@goat-sdk/plugin-coingecko-token-discovery";
import { solana } from "@goat-sdk/wallet-solana";

config();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

if (!COINGECKO_API_KEY) {
    console.error("COINGECKO_API_KEY environment variable is required");
    process.exit(1);
}
if (!SOLANA_PRIVATE_KEY || !SOLANA_RPC_URL) {
    console.error("SOLANA_PRIVATE_KEY and SOLANA_RPC_URL environment variables are required for Solana");
    process.exit(1);
}

(async (): Promise<void> => {
    // 1. Create a Solana wallet client
    const connection = new Connection(SOLANA_RPC_URL as string);
    const keypair = Keypair.fromSecretKey(base58.decode(SOLANA_PRIVATE_KEY as string));
    const solWalletClient = solana({
        keypair,
        connection,
    });

    // 2. Initialize the CoinGecko plugin
    const coinGeckoPlugin = coinGeckoTokenDiscovery({
        apiKey: COINGECKO_API_KEY,
    });

    // 3. Get your onchain tools for your wallet with the CoinGecko plugin
    const tools = await getOnChainTools({
        wallet: solWalletClient,
        plugins: [coinGeckoPlugin],
    });

    // 4. Create a LangChain agent with the tools
    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
    });

    const prompt = await pull<ChatPromptTemplate>("hwchase17/structured-chat-agent");

    const agent = await createStructuredChatAgent({
        llm,
        tools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
        returnIntermediateSteps: true,
    });

    // 5. Create a readline interface to interact with the agent
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("🔍 Solana wallet with CoinGecko token discovery initialized");
    console.log("You can ask questions like 'Look up information about USDC' or 'Find token with ticker BONK'");

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });

        if (prompt === "exit") {
            rl.close();
            break;
        }

        try {
            const response = await agentExecutor.invoke({
                input: prompt,
            });

            console.log("\nFinal Response:", response.output);

            // Display the intermediate steps with tool invocations
            if (response.intermediateSteps && response.intermediateSteps.length > 0) {
                console.log("\nIntermediate Steps:");
                for (const step of response.intermediateSteps) {
                    if (step.action) {
                        console.log(`\nTool: ${step.action.tool}`);
                        console.log(`Tool Input: ${JSON.stringify(step.action.toolInput, null, 2)}`);
                        console.log(`Tool Output: ${step.observation}`);
                    }
                }
            }
        } catch (error) {
            console.error("Error executing agent:", error);
        }
    }
})();
