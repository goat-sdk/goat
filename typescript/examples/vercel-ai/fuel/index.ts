import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { fuel, sendFuelETH } from "@goat-sdk/wallet-fuel";
import { Provider } from "fuels";

require("dotenv").config();

const privateKey = process.env.FUEL_WALLET_PRIVATE_KEY as string;

(async () => {
    const provider = await Provider.create("https://mainnet.fuel.network/v1/graphql");

    const tools = await getOnChainTools({
        wallet: fuel({
            privateKey,
            provider,
        }),
        plugins: [sendFuelETH()],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 10,
        prompt: "Send 0.001 ETH to 0x8F8afB12402C9a4bD9678Bec363E51360142f8443FB171655eEd55dB298828D1, return the transaction hash, make sure you check i have enough ETH to cover the transaction",
    });

    console.log(result.text);
})();
