import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { MODESPRAY_ABI, MODESPRAY_ADDRESSES } from "./abi/modespray";
import { SprayEtherParams } from "./parameters";

export class ModeSprayService {
    @Tool({
        name: "disperse_eth_to_multiple_addresses",
        description: "Spray or Disperse Ether to multiple recipients",
    })
    async sprayEther(walletClient: EVMWalletClient, parameters: SprayEtherParams): Promise<string> {
        try {
            const { recipients, amounts } = parameters;

            const network = walletClient.getChain();
            if (!network?.id) {
                throw new Error("Unable to determine chain ID from wallet client");
            }

            const address = this.getContractAddress(network.id);
            const sprayAddress = await walletClient.resolveAddress(address);

            const totalValue = amounts.reduce((sum, amount) => sum + BigInt(amount), BigInt(0));

            const { hash } = await walletClient.sendTransaction({
                to: sprayAddress,
                abi: MODESPRAY_ABI,
                functionName: "sprayEther",
                args: [recipients, amounts],
                value: totalValue,
            });

            return hash;
        } catch (error) {
            throw new Error(`Failed to disperse Ether: ${error}`);
        }
    }

    // TO-DO: next function
    // @Tool({
    //     name: "disperse_erc20_token_to_multiple_addresses",
    //     description: "Spray or Disperse ERC-20 tokens to multiple recipients",
    // })
    // async sprayToken(
    //     walletClient: EVMWalletClient,
    //     parameters: SprayErc20TokenParams
    // ): Promise<string> {
    //     try {
    //         const { token, recipients, amounts } = parameters;

    //         const network = walletClient.getChain();
    //         if (!network?.id) {
    //             throw new Error(
    //                 "Unable to determine chain ID from wallet client"
    //             );
    //         }

    //         const address = this.getContractAddress(network.id);

    //         const tx = await walletClient.sendTransaction({
    //             to: address,
    //             abi: MODESPRAY_ABI,
    //             functionName: "disperseToken",
    //             args: [token, recipients, amounts],
    //         });

    //         return tx.hash;
    //     } catch (error) {
    //         throw new Error(`Failed to disperse tokens: ${error}`);
    //     }
    // }

    getContractAddress(chainId: number): string {
        const address = MODESPRAY_ADDRESSES[chainId];
        if (!address) {
            throw new Error(`ModeSpray contract not available for chainId: ${chainId}`);
        }
        return address;
    }
}
