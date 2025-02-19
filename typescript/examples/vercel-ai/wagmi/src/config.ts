import { sepolia } from "viem/chains";
import { http, createConfig } from "wagmi";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

export default createConfig({
    chains: [sepolia],
    connectors: [
        injected(),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        }),
        metaMask(),
        safe(),
    ],
    transports: {
        [sepolia.id]: http(),
    },
});
