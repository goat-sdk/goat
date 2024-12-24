import { CrossmintApiClient } from "@crossmint/common-sdk-base";
import { faucetPlugin, mintPlugin } from "./plugins";
import { custodialFactory, smartWalletFactory } from "./wallets";
import { walletsPlugin } from "./plugins/wallets.plugin";
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
        faucet: faucetPlugin(apiClient),
        mint: mintPlugin(apiClient),
        wallets: walletsPlugin(apiClient),
    };
}

export { crossmint };
