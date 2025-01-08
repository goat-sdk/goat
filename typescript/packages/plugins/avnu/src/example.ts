import * as dotenv from "dotenv"
import { AvnuService } from "./avnu.service"
import { Avnu } from "./avnu.plugin";

dotenv.config();

interface token {
    address: string,
    decimals: number
}

const main = async () => {
    try {
        const s = new AvnuService()
        const account = s.account;

        const ETH_ADDRESS: token = {
            address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            decimals: 18
        };
        const USDC_ADDRESS: token = {
            address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
            decimals: 6
        };

        const STARK_ADDRESS: token = {
            address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            decimals: 18
        };

        function toBaseUnits(amount: number, token: token): bigint {
            const multiplier = Math.pow(10, token.decimals);
            const amountStr = (amount * multiplier).toString();
            return BigInt(amountStr);
        };

        const sellingAmount = toBaseUnits(0.01, USDC_ADDRESS)
        const params = {
            sellTokenAddress: USDC_ADDRESS.address,
            buyTokenAddress: STARK_ADDRESS.address,
            sellAmount: sellingAmount,
            takerAddress: account.address,
            size: 1,
        };
        
        const quotes = await s.getQuote(params)
        
        if (!quotes.length) {
            throw new Error("No quotes available");
        }
        
        console.log({
            quoteId: quotes[0].quoteId,
            sellAmount: quotes[0].sellAmount,
            sellAmountInUsd: quotes[0].sellAmountInUsd,
            buyAmount: quotes[0].buyAmount,
            buyAmountInUsd: quotes[0].buyAmountInUsd,
            gasFees: quotes[0].gasFees,
            gasFeesInUsd: quotes[0].gasFeesInUsd,
            priceRatioUsd: quotes[0].priceRatioUsd,
        });
        
        const swapResponse = await s.Swap(quotes[0])
        console.log("Swap executed successfully!");
        console.log("Transaction Hash:", swapResponse.transactionHash);
        console.log("Voyager Link:", `https://voyager.online/tx/${swapResponse.transactionHash}`);
        
    } catch (error) {
        console.error("Error executing swap:");
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});

