import { GameAgent, GameWorker } from "@virtuals-protocol/game";

import { http } from "viem";
import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import { VirtualsGameAdapter } from "@goat-sdk/adapter-virtuals-game";
import { PEPE, USDC, erc20 } from "@goat-sdk/plugin-erc20";
import { sendETH } from "@goat-sdk/wallet-evm";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: mode,
});

const wallet = viem(walletClient);

(async () => {
    const adapter = new VirtualsGameAdapter({
        wallet: wallet,
        plugins: [sendETH(), erc20({ tokens: [USDC, PEPE] })],
    });
    const workerFunctions = await adapter.getAdaptedTools();

    const onChainWorker = new GameWorker({
        id: "onchain_worker",
        name: "Onchain worker",
        description: "Worker that executes onchain actions",
        functions: [...workerFunctions],
    });

    const agent = new GameAgent(process.env.VIRTUALS_GAME_API_KEY as string, {
        name: "Onchain agent",
        goal: "Swap 0.01 USDC to MODE",
        description: "An agent that executes onchain actions",
        workers: [onChainWorker],
    });

    await agent.init();

    await agent.run(10, {
        verbose: true,
    });
})();
