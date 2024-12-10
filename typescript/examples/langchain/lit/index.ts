import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { http } from "viem";
import { createWalletClient } from "viem";
import { sepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-langchain";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/core";

import { LIT_NETWORK as _LIT_NETWORK } from "@lit-protocol/constants";
import {
    createEthersWallet,
    createLitContractsClient,
    createLitNodeClient,
    generateWrappedKey,
    getPKPSessionSigs,
    lit,
    mintCapacityCredit,
    mintPKP
} from "@goat-sdk/wallet-lit";

require("dotenv").config();

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
const RPC_PROVIDER_URL = process.env.RPC_PROVIDER_URL as string;
const LIT_NETWORK = _LIT_NETWORK.DatilTest;

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
});

(async (): Promise<void> => {
    console.log('🔄 Creating Lit Node Client...');
    const litNodeClient = await createLitNodeClient(LIT_NETWORK);

    console.log('🔄 Creating Ethers Wallet...');
    const ethersWallet = createEthersWallet(WALLET_PRIVATE_KEY);
    
    console.log('🔄 Creating Lit Contracts Client...');
    const litContractsClient = await createLitContractsClient(ethersWallet, LIT_NETWORK);
    
    console.log('🔄 Minting Capacity Credit...');
    const capacityCredit = await mintCapacityCredit(litContractsClient, 10, 30);
    console.log(`ℹ️  Minted Capacity Credit with token id: ${capacityCredit.capacityTokenId}`);
    
    console.log('🔄 Minting PKP...');
    const pkp = await mintPKP(litContractsClient);
    console.log(`ℹ️  Minted PKP with public key: ${JSON.stringify(pkp, null, 2)}`);
    
    console.log('🔄 Getting PKP Session Sigs...');
    const pkpSessionSigs = await getPKPSessionSigs(litNodeClient, pkp.publicKey, pkp.ethAddress, ethersWallet, capacityCredit.capacityTokenId);
    
    console.log('🔄 Generating Wrapped Key...');
    const wrappedKey = await generateWrappedKey(litNodeClient, pkpSessionSigs, "evm");

    console.log('ℹ️  Finished Lit Setup!')

    const viemWalletClient = createWalletClient({
        transport: http(RPC_PROVIDER_URL),
        chain: sepolia,
    });
    const litWallet = lit({
        litNodeClient,
        pkpSessionSigs,
        wrappedKeyId: wrappedKey.id,
        network: "evm",
        chainId: 11155111,
        litEVMChainIdentifier: 'sepolia',
        viemWalletClient,
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
})(); 
