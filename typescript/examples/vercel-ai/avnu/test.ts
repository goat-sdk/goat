import { Account, RpcProvider} from "starknet";
import { executeSwap, fetchQuotes, AvnuOptions } from "@avnu/avnu-sdk";
import * as dotenv from "dotenv";

dotenv.config();

// Configuration
const AVNU_OPTIONS: AvnuOptions = { baseUrl: process.env.BASE_URL };
const STARKNET_RPC = process.env.STARKNET_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS!;

if (!PRIVATE_KEY || !ACCOUNT_ADDRESS) {
    throw new Error("PRIVATE_KEY and ACCOUNT_ADDRESS must be set in the .env file");
}

// Token addresses and decimals
const ETH_ADDRESS = {
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18
};
const USDC_ADDRESS = {
    address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    decimals: 6
};

const STARK_ADDRESS = {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    decimals: 18
};

function toBaseUnits(amount: number, decimals: number): bigint {
    const multiplier = Math.pow(10, decimals);
    const amountStr = (amount * multiplier).toString();
    return BigInt(amountStr);
}

async function main() {
    try {
        // Initialize provider and account
        const provider = new RpcProvider({ nodeUrl: STARKNET_RPC });
        const account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
        const sellingAmount = toBaseUnits(0.01, USDC_ADDRESS.decimals);
        
        console.log("Account:", account.address);

        // Prepare swap parameters
        const params = {
            sellTokenAddress: USDC_ADDRESS.address,
            buyTokenAddress: ETH_ADDRESS.address,
            sellAmount: sellingAmount, // 0.2 ETH -> 200000000000000000
            takerAddress: account.address,
            size: 1,
        };

        // Get quotes
        console.log("Fetching quotes...");
        const quotes = await fetchQuotes(params, AVNU_OPTIONS);
        
        if (!quotes.length) {
            console.error("No quotes available");
            return;
        }

        console.log("Best quote:", quotes[0]);
        
        // Execute the swap
        console.log("Executing swap...");
        const swapResponse = await executeSwap(account, quotes[0], {
            executeApprove: true,
            slippage: 0.01  // 1% slippage
        }, AVNU_OPTIONS);

        console.log("Swap executed successfully!");
        console.log("Transaction Hash:", swapResponse.transactionHash);
        console.log("Voyager Link:", `https://voyager.online/tx/${swapResponse.transactionHash}`);

    } catch (error: any) {
        console.error("Error:", error?.message || "Unknown error occurred");
    }
}

main();
