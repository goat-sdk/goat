import { type Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";
import type { Plugin, SolanaWalletClient } from "@goat-sdk/core";
import { getAssetWithProof, mplBubblegum, transfer } from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey, toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

export function nfts(connection: Connection): Plugin<SolanaWalletClient> {
    return {
        name: "nfts",
        supportsSmartWallets: () => false,
        supportsChain: (chain) => chain.type === "solana",
        getTools: async () => {
            return [
                {
                    name: "transfer_nft",
                    description: "This {{tool}} sends an NFT from your wallet to an address on a Solana chain.",
                    parameters: transferNFTParametersSchema,
                    method: transferNFTMethod(connection),
                },
            ];
        },
    };
}

const transferNFTParametersSchema = z.object({
    recipientAddress: z.string().describe("The address to send the NFT to"),
    assetId: z.string().describe("The asset ID of the NFT to send"),
});

const transferNFTMethod =
    (connection: Connection) =>
    async (
        walletClient: SolanaWalletClient,
        parameters: z.infer<typeof transferNFTParametersSchema>,
    ): Promise<string> => {
        const { recipientAddress, assetId } = parameters;
        const umi = createUmi(connection);
        umi.use(mplBubblegum());
        const assetWithProof = await getAssetWithProof(umi, fromWeb3JsPublicKey(new PublicKey(assetId)));
        const instructions = transfer(umi, {
            ...assetWithProof,
            leafOwner: fromWeb3JsPublicKey(new PublicKey(walletClient.getAddress())),
            newLeafOwner: fromWeb3JsPublicKey(new PublicKey(recipientAddress)),
        }).getInstructions();

        const result = await walletClient.sendTransaction({
            instructions: instructions.map(toWeb3JsInstruction),
        });

        return result.hash;
    };
