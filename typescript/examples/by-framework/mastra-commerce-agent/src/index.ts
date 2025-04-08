import readline from "node:readline";
import "dotenv/config";

import { mastra } from "./mastra/index.js";

(async () => {
    const agent = mastra.getAgent("shopifyAgent");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("Gymshark Customer Service Agent CLI");
    console.log("Type 'exit' to quit or 'twilio' to start the Twilio SMS server");
    console.log("--------------------");

    while (true) {
        const prompt = await new Promise<string>((resolve) => {
            rl.question("Enter your prompt: ", resolve);
        });

        if (prompt.toLowerCase() === "exit") {
            rl.close();
            break;
        }

        if (prompt.toLowerCase() === "twilio") {
            console.log("Starting Twilio SMS server...");
            const { startTwilioServer } = await import("./twilio/server.js");
            startTwilioServer();
            continue;
        }

        console.log("\n-------------------\n");
        console.log("TOOLS CALLED");
        console.log("\n-------------------\n");

        try {
            const result = await agent.generate(prompt, {
                onStepFinish: (stepResult) => {
                    console.log(stepResult.toolCalls);
                },
            });

            console.log("\n-------------------\n");
            console.log("RESPONSE");
            console.log("\n-------------------\n");
            console.log(result.text);
        } catch (error) {
            console.error(error);
        }

        console.log("\n-------------------\n");
    }
})();
