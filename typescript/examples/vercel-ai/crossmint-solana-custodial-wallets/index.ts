import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { crossmint } from "@goat-sdk/crossmint";
import { Connection } from "@solana/web3.js";

require("dotenv").config();

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;
const email = process.env.EMAIL;

if (!apiKey || !email) {
    throw new Error("Missing environment variables");
}

const { custodial } = crossmint(apiKey);

(async () => {
    const tools = await getOnChainTools({
        wallet: await custodial({
            chain: "solana",
            email: email,
            connection: new Connection("https://api.devnet.solana.com", "confirmed"),
        }),
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Get my balance in SOL",
    });

    console.log(result.text);
})();
