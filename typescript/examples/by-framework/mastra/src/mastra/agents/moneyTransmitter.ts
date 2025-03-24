import "dotenv/config";

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-mastra";
import { USDC, erc20 } from "@goat-sdk/plugin-erc20";

import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: baseSepolia,
});

const tools = await getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        sendETH(), // Enable ETH transfers
        erc20({ tokens: [USDC] }), // Enable ERC20 token operations
    ],
});

export const moneyTransmitter = new Agent({
    name: "Money Transmitter Agent",
    instructions: `You are a money transmitter agent. You are responsible for sending money to the user's wallet.`,
    model: openai("gpt-4o-mini"),
    tools: tools,
});
