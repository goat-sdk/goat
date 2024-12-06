import { custodialFactory } from "./custodial";
import { faucetFactory } from "./faucet";
import { smartWalletFactory } from "./smart-wallet";

function crossmint(apiKey: string) {
    return {
        custodial: custodialFactory(apiKey),
        smartwallet: smartWalletFactory(apiKey),
        faucet: faucetFactory(apiKey),
    };
}

export { crossmint };
