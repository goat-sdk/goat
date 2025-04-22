import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { viem } from "../../../packages/wallets/viem/dist/ViemEVMWalletClient.js";

import dotenv from "dotenv";
import { HyperlaneService } from "../../../packages/plugins/hyperlane/dist/hyperlane.service.js";
dotenv.config();
// 1. Create the wallet client
console.log(process.env.WALLET_PRIVATE_KEY);
const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: sepolia,
});
// const wallet = viem(walletClient);
const hyperlane = new HyperlaneService();
const chain = process.env.HYPERLANE_CHAIN as string;
const whitelist = "0x0Ef3456E616552238B0c562d409507Ed6051A7b3";
const gasPaymentConfig = {
    minGas: 0.0001,
    maxGas: 0.0003,
    gasToken: "ethereum",
};

const wallet = viem(walletClient);

async function main() {
    const relayerConfig = await hyperlane.sendMessage(wallet, {
        originChain: "sepolia",
        destinationChain: "linea",
        destinationAddress: "0x0Ef3456E616552238B0c562d409507Ed6051A7b3",
        message: "hello",
        // whitelist: whitelist,
        // blacklist,
        // gasPaymentConfig: gasPaymentConfig,
    });
    // console.log("Relayer Config: ", relayerConfig);
}

main();
