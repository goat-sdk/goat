import { runEvals } from "@goat-sdk/core";
import { ChatOpenAI } from "@langchain/openai";
import { coingecko } from "../coingecko.plugin";
import { COINGECKO_ALL_TOOLS_DATASET } from "./dataset";

require("dotenv").config();

// Set up LLM
const langchainLLM = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.3,
});

const mockWallet = {
    getChain: () => ({
        type: "UNUSED",
    }),
    getCoreTools: () => [],
};

// Type for JSON Schema object
interface JSONSchema {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
}

// Create LLM wrapper with the expected interface
const llm = {
    invoke: async (params: {
        messages: { role: string; content: string }[];
        tools: {
            type: string;
            function: { name: string; description: string; parameters: unknown };
        }[];
    }) => {
        // Transform the tools to ensure the parameters schema is correctly formatted
        const formattedTools = params.tools.map((tool) => ({
            ...tool,
            function: {
                ...tool.function,
                // Ensure parameters is a valid JSON Schema object with type:"object"
                parameters: {
                    type: "object",
                    properties: (tool.function.parameters as JSONSchema)?.properties || {},
                    required: (tool.function.parameters as JSONSchema)?.required || [],
                },
            },
        }));

        // Call LangChain OpenAI with properly formatted tools
        const response = await langchainLLM.invoke(params.messages, {
            tools: formattedTools,
        });

        return {
            tool_calls: response.tool_calls?.map((call) => ({
                name: call.name,
                args: call.args,
            })),
        };
    },
};

// Create wallet client
async function runTest() {
    try {
        const result = await runEvals(
            COINGECKO_ALL_TOOLS_DATASET,
            {
                wallet: mockWallet as any,
                plugins: [coingecko({ apiKey: "" })],
                llm,
            },
            "Coingecko Plugin Evaluation Tests",
        );

        console.log("\nEvaluation Summary:");
        console.log(`Success: ${result.success}`);
        console.log(`Total: ${result.results.length}`);
        console.log(`Passed: ${result.results.filter((r) => r.passed).length}`);
        console.log(`Failed: ${result.results.filter((r) => !r.passed).length}`);
    } catch (error) {
        console.error("Error running evaluations:", error);
    }
}

runTest();
