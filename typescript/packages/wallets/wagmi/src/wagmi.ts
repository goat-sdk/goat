import type { Config } from "@wagmi/core";

import { WagmiWalletClient } from "./clients";

export default function wagmi(config: Config): WagmiWalletClient {
    return new WagmiWalletClient(config);
}
