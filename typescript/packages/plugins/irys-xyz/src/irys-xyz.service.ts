import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ConstructableNodeToken, Uploader } from "@irys/upload";
import {
    Arbitrum,
    Avalanche,
    BNB,
    BaseEth,
    Bera,
    Chainlink,
    Ethereum,
    Iotex,
    LineaEth,
    Matic,
    ScrollEth,
    USDCEth,
    USDCPolygon,
} from "@irys/upload-ethereum";
import { IrysDeployParams } from "./parameters";

export class IrysXyzService {
    /**
     * Plugin 1: Deploy/integrate an Irys plug-in on GOAT.
     */
    @Tool({
        name: "deploy_irys_plugin",
        description: "Deploy and integrate an Irys plug-in on GOAT for onchain storage operations",
    })
    async deployIrysPlugin(walletClient: EVMWalletClient, parameters: IrysDeployParams): Promise<string> {
        try {
            const irysUploader = await this.getIrysUploaderForToken(parameters.token);
            const irysAddress = irysUploader.address;
            return `Irys plugin deployed successfully with address ${irysAddress}`;
        } catch (error) {
            return `Failed to deploy Irys plugin: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
        }
    }

    private async getIrysUploaderForToken(tokenParam?: string) {
        // The token is obtained from the parameter; by default 'ethereum' is used.
        const tokenName = tokenParam?.toLowerCase() ?? "ethereum";
        // Mapping dictionary between names and imported tokens.
        const tokenMapping: { [key: string]: ConstructableNodeToken } = {
            ethereum: Ethereum,
            matic: Matic,
            bnb: BNB,
            avalanche: Avalanche,
            baseeth: BaseEth,
            usdceth: USDCEth,
            arbitrum: Arbitrum,
            chainlink: Chainlink,
            usdcpolygon: USDCPolygon,
            bera: Bera,
            scrolleth: ScrollEth,
            lineaeth: LineaEth,
            iotex: Iotex,
        };
        const tokenConstructor = tokenMapping[tokenName];
        if (!tokenConstructor) {
            throw new Error(`Token '${tokenName}' not supported`);
        }
        return await Uploader(tokenConstructor).withWallet(process.env.WALLET_PRIVATE_KEY as `0x${string}`);
    }
}
