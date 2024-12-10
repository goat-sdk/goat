import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { getOnChainTools } from "@goat-sdk/adapter-langchain";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/core";
import { createEthersWallet, createLitContractsClient, createLitNodeClient, generateWrappedKey, getPKPSessionSigs, lit, mintCapacityCredit, mintPKP } from "@goat-sdk/wallet-lit";
import { LIT_NETWORK } from "@lit-protocol/constants";

require("dotenv").config();

const llm = new ChatOpenAI({
    model: "gpt-4-mini",
});

(async (): Promise<void> => {
    const litNodeClient = await createLitNodeClient(LIT_NETWORK.Datil);
    const ethersWallet = createEthersWallet(process.env.WALLET_PRIVATE_KEY as string);
    const litContractsClient = await createLitContractsClient(ethersWallet, LIT_NETWORK.Datil);
    const capacityCredit = await mintCapacityCredit(litContractsClient, 10, 30);
    const pkp = await mintPKP(litContractsClient);
    const pkpSessionSigs = await getPKPSessionSigs(litNodeClient, pkp.publicKey, ethersWallet, capacityCredit.capacityTokenId);
    const wrappedKey = await generateWrappedKey(litNodeClient, pkpSessionSigs, "evm");

    const litWallet = lit({
        litNodeClient,
        pkpSessionSigs,
        wrappedKeyId: wrappedKey.id,
        network: "evm",
        chainId: 11155111,
    });

    const prompt = await pull<ChatPromptTemplate>("hwchase17/structured-chat-agent");

    const tools = await getOnChainTools({
        wallet: litWallet,
        plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] })],
    });

    const agent = await createStructuredChatAgent({
        llm,
        tools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    });

    const response = await agentExecutor.invoke({
        input: "Get my balance in USDC",
    });

    console.log("Response:", response);
})().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
}); 