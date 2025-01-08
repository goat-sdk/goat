import readline from "node:readline";
import { createXai } from "@ai-sdk/xai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { Avnu } from "./avnu.plugin";
import * as dotenv from "dotenv";

dotenv.config();

(async () => {
    const tools = await getOnChainTools({
        plugins: [Avnu()],
    });

    const xai = createXai({
        apiKey: process.env.XAI_API_KEY,
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question('Enter your prompt (or "exit" to quit): ', resolve);
        });

        if (prompt === "exit") {
            rl.close();
            break;
        }

        console.log("\n-------------------\n");
        console.log("TOOLS CALLED");
        console.log("\n-------------------\n");

        try {
            const result = await generateText({
                model: xai("grok-beta"),
                tools: tools,
                maxSteps: 10,
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

