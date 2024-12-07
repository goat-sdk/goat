import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { crossmint } from "@goat-sdk/crossmint";
import { Connection } from "@solana/web3.js";
import { nfts } from "@goat-sdk/plugin-solana-actions";

require("dotenv").config();

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;
const email = process.env.EMAIL;

if (!apiKey || !email) {
    throw new Error("Missing environment variables");
}

const { custodial } = crossmint(apiKey);
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

(async () => {
    const tools = await getOnChainTools({
        wallet: await custodial({
            chain: "solana",
            address: "3q1PB3Yde3wUnJ45RLrAhCg3W1n9HEC8Jd9NkfuhRGS1",
            env: "staging",
            connection,
        }),
        plugins: [nfts(connection)],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "Transfer NFT with assetId 57hD2akP2FsEwnDMJn8CNS565p2dNUz8UKuQ5tUGEsh7 to the wallet CKkeuMRjRsM9zBNnFVRRYhQ3rg4uL4tPkaADNLgk2omb",
    });

    console.log(result.text);
})();
