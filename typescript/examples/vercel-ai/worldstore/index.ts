import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

import { viem } from "@goat-sdk/wallet-viem";
import { worldstore } from "@goat-sdk/plugin-worldstore";

import fs from "fs";
require("dotenv").config();

const account = privateKeyToAccount(
	process.env.WALLET_PRIVATE_KEY as `0x${string}`,
);

const walletClient = createWalletClient({
	account: account,
	transport: http(process.env.ALCHEMY_API_KEY),
	chain: sepolia,
});

(async () => {
	const tools = await getOnChainTools({
		wallet: viem(walletClient),
		plugins: [
			worldstore(),
		],
	});

	const searchPrompt = "\nI'm looking to buy a new snowboard, my favorite color is red\n";
	console.log(searchPrompt);
	const result = await generateText({
		model: openai("gpt-4o-mini"),
		tools: tools,
		maxSteps: 5,
		prompt: searchPrompt,
	});


	const searchProductToolResult = getSearchProductsToolResult(result);

	// save result to file
	fs.writeFileSync("result.json", JSON.stringify(result, null, 2));

	console.log(result.text);
	const userResponse = await getUserInput();
	console.log(`\n`);


	const purchasePrompt = `
	Previous search result: ${searchProductToolResult}
	
	User response: "${userResponse}"
	
	Based on this response and the previous search result, if the user wants to purchase the item, proceed with the purchase using the product details from the search. If they decline or are unsure, acknowledge their response politely.`;

	const purchaseResult = await generateText({
		model: openai("gpt-4o-mini"),
		tools: tools,
		maxSteps: 5,
		prompt: purchasePrompt,
	});

	console.log(purchaseResult.text);

	// console.log(result);

	// console.log(result.text);
	// Exit the process after user input
    process.exit(0);
})();



function getSearchProductsToolResult(result: Awaited<ReturnType<typeof generateText>>) {
	const searchProductToolResult = result.steps[0].toolResults.find(toolResult => (toolResult as any).toolName === "search_products");
	if (!searchProductToolResult) {
		throw new Error("Search products tool result not found");
	}
	return (searchProductToolResult as any).result;
}


// Wait for user input in console to continue
async function getUserInput() {
    // wait for user input, enter to continue, and convert Buffer to string

	console.log("--------------------------------");
	console.log("Type your response and press enter to continue...\n");
    return await new Promise<string>(resolve => 
        process.stdin.once('data', data => resolve(data.toString().trim()))
    );
}