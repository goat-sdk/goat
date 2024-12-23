import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { tee } from "@goat-sdk/plugin-tee";
import { solana } from "@goat-sdk/wallet-solana";

import { Connection, Keypair } from "@solana/web3.js";
import { TEEMode } from "@goat-sdk/plugin-tee/dist/tee.types";

require("dotenv").config();

const connection = new Connection(process.env.SOLANA_RPC_URL as string);
const teeMode = process.env.TEE_MODE as TEEMode;
const secretSalt = process.env.SOLANA_SECRET_SALT as string;
const keypair = Keypair.fromSecretKey(
    new Uint8Array([45, 186, 81, 206, 2, 138, 183, 11, 152, 232, 183, 162, 209, 222, 160, 212, 50, 142, 242, 39, 248, 152, 218, 234, 253, 222, 160, 14, 127, 117, 86, 12, 13, 106, 131, 137, 193, 153, 237, 23, 213, 65, 1, 94, 135, 250, 70, 41, 175, 52, 174, 132, 106, 111, 200, 139, 104, 53, 212, 199, 103, 61, 101, 52])

);

(async () => {
    const tools = await getOnChainTools({
        wallet: solana({
            keypair,
            connection,
        }),
        plugins: [tee({teeMode, teeSecretSalt: secretSalt})],
    });

    const derivedKey = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 10,
        prompt: `derive a key with path: "/", subject: ${secretSalt}`,
    });

    console.log(derivedKey.text);

    const remoteAttestation = await generateText({
        model: openai("gpt-4o"),
        tools: tools,
        maxSteps: 10,
        prompt: `generate a remote attestation quote for the report data: "hello human"`,
    });

    console.log(remoteAttestation.text);
})();