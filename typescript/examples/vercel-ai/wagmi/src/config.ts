import { mainnet } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

export default createConfig({
    chains: [mainnet],
    connectors: [
        injected(),
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        }),
        metaMask(),
        safe(),
    ],
    transports: {
        [mainnet.id]: http(),
    },
});
