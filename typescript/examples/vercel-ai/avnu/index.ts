import readline from "node:readline";
import { RpcProvider, Account } from "starknet";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ollama } from "ollama-ai-provider";


import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { starknet } from "@goat-sdk/wallet-starknet";
import { Avnu } from "@goat-sdk/plugin-avnu";
import { STARKNET_TOKENS, starknetToken } from "@goat-sdk/plugin-starknet-token";


require("dotenv").config();

const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC });
    const account = new Account(
        provider,
        process.env.ACCOUNT_ADDRESS as string,
        process.env.PRIVATE_KEY as string
    );
    const wallet = starknet({ starknetAccount: account, starknetClient: provider });

const SWAP_ASSISTANT_PROMPT = `You are a helpful assistant that executes token swaps on Starknet. 

To perform a swap, you MUST follow these steps in order and use the EXACT values returned from each tool:

1. Get token addresses:
   For each token (sell and buy), either:
   - If a symbol is provided (like ETH, USDC, STARK): use get_token_info_by_symbol
   - If an address is provided: use that address directly
   Save both addresses for use in step 3

2. Use convert_to_base_unit:
   - Use the amount from user's request
   - Save the exact number returned

3. Use executeSwap:
   - sellTokenAddress: Use the address from step 1 for sell token
   - buyTokenAddress: Use the address from step 1 for buy token
   - sellAmount: Use the EXACT number from step 2

Example flows:
1. Using symbols:
   - get_token_info_by_symbol("USDC") -> returns address1
   - get_token_info_by_symbol("STARK") -> returns address2
   - convert_to_base_unit("0.01") -> returns amount
   - executeSwap with {sellTokenAddress: address1, buyTokenAddress: address2, sellAmount: amount}

2. Using addresses:
   - Sell token address provided directly: 0x123...
   - Buy token address provided directly: 0x456...
   - convert_to_base_unit("0.01") -> returns amount
   - executeSwap with {sellTokenAddress: "0x123...", buyTokenAddress: "0x456...", sellAmount: amount}

DO NOT proceed to the next step until you have the actual values from the current step.
DO NOT use placeholder values like <TOKEN_ADDRESS> or <BASE_UNIT_AMOUNT>.

User request: `;

(async () => {
    const tools = await getOnChainTools({
        wallet: wallet,
        plugins: [Avnu(), starknetToken({ tokens: STARKNET_TOKENS })],
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while (true) {
        let prompt = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });
        
        prompt = SWAP_ASSISTANT_PROMPT + prompt;

        if (prompt === "exit") {
            rl.close();
            break;
        }
        console.log(prompt)
        console.log("\n-------------------\n");
        console.log("TOOLS CALLED");
        console.log("\n-------------------\n");

        console.log("\n-------------------\n");
        console.log("RESPONSE");
        console.log("\n-------------------\n");
        try {
            const result = await generateText({
                model: ollama("qwen2.5-coder:14b"),
                tools: tools,
                maxSteps: 15,
                prompt: prompt,
                onStepFinish: (event) => {
                    console.log(event.toolResults);
                },
            });
            console.log(result.text);
        } catch (error) {
            console.error(error);
        }
        console.log("\n-------------------\n");
    }
})();
