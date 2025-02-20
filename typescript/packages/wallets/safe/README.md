# Goat Wallet Safe 🐐 - TypeScript

## Installation
```
npm install @goat-sdk/wallet-safe
```

## Usage
```typescript
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { baseSepolia } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-langchain";

import { sendETH } from "@goat-sdk/wallet-evm";
import { safe } from "@goat-sdk/wallet-safe";

require("dotenv").config();

const pk = process.env.WALLET_PRIVATE_KEY as `0x${string}`;

const llm = new Ollama({
    model: "llama3.2:latest",
});

(async (): Promise<void> => {
    const prompt = await pull<ChatPromptTemplate>("hwchase17/structured-chat-agent");

    const tools = await getOnChainTools({
        // The wallet will be deployed on chain and requires eth beforehand.
        wallet: await safe(pk, baseSepolia),
        plugins: [sendETH()],
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
        input: "Send 0.00001 eth to 0xBd33b475626b81A77d7b687AeCc9D547312691ac",
    });

    console.log(response);
})();

```
