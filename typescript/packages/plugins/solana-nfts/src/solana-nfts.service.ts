import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { transfer } from "@metaplex-foundation/mpl-bubblegum";
import { getAssetWithProof } from "@metaplex-foundation/mpl-bubblegum";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { type Umi, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import type { Connection } from "@solana/web3.js";
import { TransferNftParameters } from "./parameters";

export class SolanaNftsService {
    umi: Umi;
    constructor(private readonly connection: Connection) {
        this.umi = createUmi(connection);
    }

    @Tool({
        description: "Sends an NFT from your wallet to an address on a Solana chain.",
    })
    async transferNFT(walletClient: SolanaWalletClient, parameters: TransferNftParameters) {
        const { recipientAddress, assetId } = parameters;
        const umi = this.umi.use(mplBubblegum());

        const assetWithProof = await getAssetWithProof(this.umi, publicKey(assetId), {
            truncateCanopy: true,
        });
        const instructions = transfer(umi, {
            ...assetWithProof,
            leafOwner: publicKey(walletClient.getAddress()),
            newLeafOwner: publicKey(recipientAddress),
        }).getInstructions();

        const result = await walletClient.sendTransaction({
            instructions: instructions.map(toWeb3JsInstruction),
        });

        return result.hash;
    }
}
