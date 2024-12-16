import { openai } from "@ai-sdk/openai";
import { createConnection, createInMemoryEvmKeyStore, createKeyStoreInteractor } from "@chromia/ft4";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { sendCHR } from "@goat-sdk/core";
import { CHROMIA_MAINNET_BRID, chromia } from "@goat-sdk/wallet-chromia";
import { generateText } from "ai";
import { type KeyPair, createClient } from "postchain-client";

require("dotenv").config();

const privateKey = process.env.EVM_PRIVATE_KEY;

if (!privateKey) {
    throw new Error("EVM_PRIVATE_KEY is not set in the environment");
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

    const tools = await getOnChainTools({
        wallet: chromia({
            client: chromiaClient,
            accountAddress,
            keystoreInteractor,
            connection,
        }),
        plugins: [sendCHR()],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "send 0.0001 CHR to <recipient_address>, and please attach the transaction explorer link",
    });

    console.log(result.text);
})();
