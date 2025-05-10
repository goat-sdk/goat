import * as readline from "readline";
import * as dotenv from "dotenv";
import { 
  VectorStoreIndex, 
  Document, 
  serviceContextFromDefaults, 
  Gemini,
  SimpleChatEngine
} from "llamaindex";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-llamaindex";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

// Load environment variables
dotenv.config();

// Check required environment variables
if (!process.env.WALLET_PRIVATE_KEY) {
  console.error("ERROR: WALLET_PRIVATE_KEY environment variable is required");
  process.exit(1);
}

if (!process.env.RPC_PROVIDER_URL) {
  console.error("ERROR: RPC_PROVIDER_URL environment variable is required");
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

// Set the API key in the environment for LlamaIndex to use
process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;


// Initialize Gemini properly with GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use standard, officially supported model name

// Create a wallet client
const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chain: baseSepolia,
});

// Main function
async function main() {
  // Get GOAT on-chain tools for the wallet
  const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] })],
  });

  console.log(`Loaded ${tools.length} on-chain tools:`);
  tools.forEach((tool) => {
    console.log(`- ${tool.metadata.name}: ${tool.metadata.description}`);
  });

  // Define document text outside the function for clarity
  const documentText = `
    You are a helpful Web3 assistant powered by Gemini that can perform on-chain operations.
    You must use only Gemini AI for all completions and responses.
    You can check balances, send tokens, and interact with ERC-20 contracts.
    You're connected to the Base Sepolia testnet.
  `;

  // We'll create a simple helper function to chat with the model
  async function chatWithGemini(prompt: string): Promise<string> {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  // Create a simple direct query function
  const queryLLM = async (query: string) => {
    try {
      // Generate a list of available tools from our GOAT tools
      const toolDescriptions = tools.map(tool => 
        `- ${tool.metadata.name}: ${tool.metadata.description}`
      ).join('\n');

      // Prepare a prompt with context and GOAT tool information
      const prompt = `
${documentText}

Available tools:
${toolDescriptions}

User query: ${query}

Please respond to the query using the tools if necessary:
`;
      
      // Use our direct Gemini chat function instead of LlamaIndex's complete
      const response = await chatWithGemini(prompt);
      return {
        toString: () => response
      };
    } catch (error) {
      console.error("Error querying LLM:", error);
      return {
        toString: () => "Sorry, I encountered an error processing your request."
      };
    }
  };

  // Create a readline interface for user interaction
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n=== Web3 Assistant with LlamaIndex & Gemini ===");
  console.log("Connected to Base Sepolia testnet");
  console.log("This assistant can help you with on-chain tasks like:");
  console.log("- Checking your ETH and token balances");
  console.log("- Sending ETH to other addresses");
  console.log("- Transferring ERC-20 tokens like USDC and PEPE");
  console.log('\nType "exit" to quit');
  console.log("-------------------------------------------");

  // Start interactive loop
  while (true) {
    const userInput = await new Promise<string>((resolve) => {
      rl.question("\nYou: ", resolve);
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      break;
    }

    try {
      console.log("Thinking...");
      // Use the proper query format for LlamaIndex
      const response = await queryLLM(userInput);
      
      console.log(`\nAssistant: ${response.toString()}`);
    } catch (error) {
      console.error("Error processing request:", error);
    }
  }
}

// Run the main function
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});