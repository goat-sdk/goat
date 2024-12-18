import { openai } from "@ai-sdk/openai";
import { createConnection, createInMemoryEvmKeyStore, createKeyStoreInteractor } from "@chromia/ft4";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { sendCHR } from "@goat-sdk/wallet-chromia";
import { CHROMIA_MAINNET_BRID, chromia } from "@goat-sdk/wallet-chromia";
import { generateText } from "ai";
import { type KeyPair, createClient } from "postchain-client";
import { MASTER_PROMPT, getLiveTokenPrice } from './tools';
import { z } from "zod";
import readline from 'readline';
import chalk from 'chalk';
require("dotenv").config();

const privateKey = process.env.EVM_PRIVATE_KEY;

if (!privateKey) {
    throw new Error("EVM_PRIVATE_KEY is not set in the environment");
}

async function chat(tools: any) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (query: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(chalk.green.bold(query), (answer) => {
                resolve(answer);
            });
        });
    };

    const initialPriceData = await getLiveTokenPrice();
    
    let conversation = [{ 
        role: "system", 
        content: MASTER_PROMPT(JSON.stringify(initialPriceData)) 
    }];

    const enhancedTools = {
        ...tools,
        getLiveTokenPrice: {
            name: 'getLiveTokenPrice',
            description: 'Gets the current CHR token price',
            parameters: z.object({}),
            execute: async () => {
                const price = await getLiveTokenPrice();
                return `The current price of CHR is $${JSON.stringify(price)}`;
            }
        }
    };

    while (true) {
        const result = await generateText({
            model: openai("gpt-4o-mini"),
            tools: enhancedTools,
            maxSteps: 10,
            prompt: conversation.map(msg => 
                `${msg.role === 'system' ? '' : msg.role + ': '}${msg.content}`
            ).join('\n'),
        });

        console.log(chalk.blue.bold("AI Assistant:"), result.text);
        
        const userInput = await askQuestion("You: ");
        if (userInput.toLowerCase() === 'exit') {
            rl.close();
            break;
        }
        
        conversation = [
            conversation[0],
            ...conversation.slice(-3).filter(msg => msg.role !== 'system'),
            { role: "user", content: userInput },
            { role: "assistant", content: result.text }
        ];
    }
}

(async () => {
    const chromiaClient = await createClient({
        nodeUrlPool: ["https://system.chromaway.com:7740"],
        blockchainRid: CHROMIA_MAINNET_BRID.ECONOMY_CHAIN,
    });
    const connection = createConnection(chromiaClient);
    const evmKeyStore = createInMemoryEvmKeyStore({
        privKey: Buffer.from(privateKey, "hex"),
    } as KeyPair);
    const keystoreInteractor = createKeyStoreInteractor(chromiaClient, evmKeyStore);
    const accounts = await keystoreInteractor.getAccounts();
    const accountAddress = accounts[0].id.toString("hex");
    console.log("ACCOUNT ADDRESS: ", accountAddress);

    const baseTools = await getOnChainTools({
        wallet: chromia({
            client: chromiaClient,
            accountAddress,
            keystoreInteractor,
            connection,
        }),
        plugins: [sendCHR()],
    });

    const enhancedTools = {
        ...baseTools,
        getTransactionLink: {
            name: 'getTransactionLink',
            description: 'Gets the transaction explorer link',
            parameters: z.object({
                txHash: z.string()
            }),
            execute: async ({ txHash }: { txHash: string }) => {
                return `https://explorer.chromia.com/tx/${txHash}`;
            }
        }
    };
    
    await chat(enhancedTools);
})();
