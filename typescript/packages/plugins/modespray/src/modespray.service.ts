import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MODESPRAY_ABI, MODESPRAY_ADDRESSES } from "./abi/modespray";
import { Tool } from "@goat-sdk/core";

export class ModeSprayService {
    @Tool({
        name: "modespray_disperse_ether",
        description: "Disperse Ether to multiple recipients",
    })
    async disperseEther(
        walletClient: EVMWalletClient,
        parameters: { recipients: string[]; amounts: string[] }
    ): Promise<string> {
        try {
            const { recipients, amounts } = parameters;

            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error(
                    "Unable to determine chain ID from wallet client"
                );
            }

            const address = this.getContractAddress(network.id);

            const totalValue = amounts.reduce(
                (sum, amount) => sum + BigInt(amount),
                BigInt(0)
            );

            const tx = await walletClient.sendTransaction({
                to: address,
                abi: MODESPRAY_ABI,
                functionName: "disperseEther",
                args: [recipients, amounts],
                value: totalValue,
            });

            return tx.hash;
        } catch (error) {
            throw new Error(`Failed to disperse Ether: ${error}`);
        }
    }

    @Tool({
        name: "modespray_disperse_token",
        description: "Disperse ERC-20 tokens to multiple recipients",
    })
    async disperseToken(
        walletClient: EVMWalletClient,
        parameters: { token: string; recipients: string[]; amounts: string[] }
    ): Promise<string> {
        try {
            const { token, recipients, amounts } = parameters;

            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error(
                    "Unable to determine chain ID from wallet client"
                );
            }

            const address = this.getContractAddress(network.id);

            const tx = await walletClient.sendTransaction({
                to: address,
                abi: MODESPRAY_ABI,
                functionName: "disperseToken",
                args: [token, recipients, amounts],
            });

            return tx.hash;
        } catch (error) {
            throw new Error(`Failed to disperse tokens: ${error}`);
        }
    }

    getContractAddress(chainId: number): string {
        const address = MODESPRAY_ADDRESSES[chainId];
        if (!address) {
            throw new Error(
                `ModeSpray contract not available for chainId: ${chainId}`
            );
        }
        return address;
    }
}
