import readline from "node:readline";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { oneshot } from "@goat-sdk/plugin-1shot";

import { viem } from "@goat-sdk/wallet-viem";
import { sepolia } from "viem/chains";

require("dotenv").config();

// Use staging key for development, production key for mainnet
const apiKey = process.env.ONESHOT_API_KEY;
const apiSecret = process.env.ONESHOT_API_SECRET;
const businessId = process.env.ONESHOT_BUSINESS_ID;

if (!apiKey) {
    throw new Error("Missing 1Shot API key");
}

if (!apiSecret) {
    throw new Error("Missing 1Shot API secret");
}

if (!businessId) {
    throw new Error("Missing 1Shot business ID");
}

// This is a dummy account, we don't need it for anything
const account = privateKeyToAccount(
    "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF" as `0x${string}`,
);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: sepolia,
});

// 1. Create the 1Shot plugin. The plugin can change the tools it has available based on your interactions with the agent,
// so it must be persistent.
const oneShotPlugin = oneshot(apiKey, apiSecret, businessId);

(async () => {
    // 2. Create a readline interface to interact with the agent
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // 3. Get your available tools; this is a static list
    const staticTools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            oneShotPlugin, // Full access to everything in 1ShotAPI
        ],
    });

    console.log("Welcome to the 1ShotAPI example agent. This agent will help you perform any on-chain action you want. If you describe your goal, it will formulate a plan, identify the smart contracts to use, and then use the tools to carry out the plan.")
    while (true) {
        const userPrompt = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });

        if (userPrompt === "exit") {
            rl.close();
            break;
        }

        // There is a 4-part plan in order to be able to carry out any possible task on the blockchain:
        // 1. Create a plan
        // 2. Identify the smart contracts to use
        // 3. Creat the tools
        // 4. Execute the plan

        const planningPrompt = `
You are a planning agent for a blockchain assistant.

Your job is to take the user's request and break it into a sequence of on-chain actions. Each step should be atomic and should reference specific contract actions where known, or describe what kind of contract would be needed otherwise.

Return the result as a JSON array with the fields: step_number, action, token, protocol (if known), wallet (if applicable), notes.

User request: "${userPrompt}"
`;

        console.log("\n-------------------\n");
        console.log("PLANNING");
        console.log("\n-------------------\n");
        console.log(planningPrompt);

        try {
            const planningResult = await generateText({
                model: openai("gpt-4o-mini"),
                tools: staticTools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: planningPrompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });

            const discoveryPrompt = `
You are a smart contract discovery agent.

For each of the following planned steps, use your knowledge base to find one or more matching contracts and methods. Formulate a semantic query that describes the type of contract you want and use the search_smart_contracts tool to locate candidate contracts. After identifying the contract you want to use, use the assure_tools_for_smart_contract tool to ensure that the tools are available for the described methods.

Return a short description of the contracts you chose and the methods you want to use.

Steps:
${JSON.stringify(planningResult.text, null, 2)}
`;

            console.log("\n-------------------\n");
            console.log("CONTRACT DISCOVERY");
            console.log("\n-------------------\n");
            console.log(discoveryPrompt);

            const contractDiscoveryResult = await generateText({
                model: openai("gpt-4o-mini"),
                tools: staticTools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: discoveryPrompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });

            const finalExecutionPrompt = `
The user wants to: "${userPrompt}".

The original plan was: ${JSON.stringify(planningResult.text, null, 2)}.

The contract discovery results were: "${contractDiscoveryResult.text}".

You now have access to blockchain tools that can help complete this goal. Use the tools to complete each step in the plan. Be explicit about each call and explain what you're doing as you go.
`;

            console.log("\n-------------------\n");
            console.log("FINAL EXECUTION");
            console.log("\n-------------------\n");
            console.log(finalExecutionPrompt);

            const tools = await getOnChainTools({
                wallet: viem(walletClient),
                plugins: [
                    oneShotPlugin, // Full access to everything in 1ShotAPI
                ],
            });

            const finalExecutionResult = await generateText({
                model: openai("gpt-4o-mini"),
                tools: tools,
                maxSteps: 10, // Maximum number of tool invocations per request
                prompt: finalExecutionPrompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });

            console.log("\n-------------------\n");
            console.log("RESPONSE");
            console.log("\n-------------------\n");
            console.log(finalExecutionResult.text);
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
