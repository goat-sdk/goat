import { Crossmint, CrossmintApiClient } from "@crossmint/common-sdk-base";
import { custodialFactory } from "./custodial";
import { faucetFactory } from "./faucet";
import { mintingFactory } from "./mint";
import { smartWalletFactory } from "./smart-wallet";

function crossmint(apiKey: string) {
    const apiClient = new CrossmintApiClient(
        {
            apiKey,
        },
        {
            internalConfig: {
                sdkMetadata: {
                    name: "crossmint-sdk-base",
                    version: "0.1.0",
                },
            },
        },
    );

    return {
        custodial: custodialFactory(apiClient),
        smartwallet: smartWalletFactory(apiClient),
        faucet: faucetFactory(apiClient),
        mint: mintingFactory(apiClient),
    };
}

export { crossmint };
