import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { solana } from "@goat-sdk/wallet-solana";

import { sendSOL } from "@goat-sdk/core";
import { Connection, Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

require("dotenv").config();

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

const mnemonic = process.env.WALLET_MNEMONIC;

if (!mnemonic) {
    throw new Error("WALLET_MNEMONIC is not set in the environment");
}

const seed = bip39.mnemonicToSeedSync(mnemonic);
const keypair = Keypair.fromSeed(Uint8Array.from(seed).subarray(0, 32));

(async () => {
    const tools = await getOnChainTools({
        wallet: solana({
            keypair,
            connection,
        }),
        plugins: [sendSOL()],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "send 0.0001 SOL to <recipient_address>",
    });

    console.log(result.text);
})();
