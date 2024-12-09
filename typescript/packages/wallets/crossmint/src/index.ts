import { custodialFactory } from "./custodial";
import { faucetFactory } from "./faucet";
import { mintingAPIFactory } from "./mintingAPI";
import { smartWalletFactory } from "./smart-wallet";

function crossmint(apiKey: string) {
    return {
        custodial: custodialFactory(apiKey),
        smartwallet: smartWalletFactory(apiKey),
        faucet: faucetFactory(apiKey),
        mintingAPI: mintingAPIFactory(apiKey),
    };
}

export { crossmint };
