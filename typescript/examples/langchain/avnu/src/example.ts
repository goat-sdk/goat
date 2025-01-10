import { Ollama } from "@langchain/ollama";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { Account, RpcProvider } from "starknet";
import { starknet } from "@goat-sdk/wallet-starknet";
import { getOnChainTools } from "@goat-sdk/adapter-langchain";
import { Avnu } from "@goat-sdk/plugin-avnu";
import * as dotenv from "dotenv";
import readline from 'node:readline';
import { messagesStateReducer } from "@langchain/langgraph";

dotenv.config();

// Define the state structure
const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
    }),
});

type AgentState = typeof StateAnnotation.State;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    // Initialize Starknet and wallet setup
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC });
    const account = new Account(
        provider,
        process.env.ACCOUNT_ADDRESS as string,
        process.env.PRIVATE_KEY as string
    );
    const wallet = starknet({ starknetAccount: account, starknetClient: provider });

    // Initialize LLM and tools
    const llm = new Ollama({
        model: "llama3.1:8b",
        temperature: 0
    });

    const tools = await getOnChainTools({
        wallet,
        plugins: [Avnu()],
    });

    // Define agent node
    async function callModel(state: AgentState) {
        const response = await llm.invoke(state.messages);
        return { messages: [response] };
    }

    // Define tools node
    async function toolNode(state: AgentState) {
        const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
        if (lastMessage.tool_calls) {
            const results = await Promise.all(
                lastMessage.tool_calls.map(async call => {
                    const tool = tools.find(t => t.name === call.name);
                    if (tool) {
                        try {
                            const result = await tool.invoke(call.args);
                            return new AIMessage({ content: result });
                        } catch (error) {
                            return new AIMessage({ content: `Error: ${error}` });
                        }
                    }
                    return new AIMessage({ content: `Tool ${call.name} not found` });
                })
            );
            return { messages: results };
        }
        return { messages: [] };
    }

    // Define continue condition
    function shouldContinue(state: AgentState) {
        const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
        return lastMessage.tool_calls ? "tools" : "__end__";
    }

    // Create and compile graph
    const workflow = new StateGraph(StateAnnotation)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent");

    const app = workflow.compile();

    // Interactive loop
    while (true) {
        const input = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });

        if (input.toLowerCase() === 'exit') {
            rl.close();
            break;
        }

        try {
            const response = await app.invoke({
                messages: [new HumanMessage(input)]
            });
            console.log("\nFinal Response:", response.messages[response.messages.length - 1].content);
        } catch (error) {
            console.error("Error:", error);
        }
    }
})();

