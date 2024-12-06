import { Connection, PublicKey } from "@solana/web3.js";
import { parseUnits } from "viem";
import type { SolanaWalletClient } from "../wallets";
import type { Plugin } from "./plugins";
import { z } from "zod";
import { SystemProgram } from "@solana/web3.js";
import {
	mplBubblegum,
	getAssetWithProof,
	transfer,
} from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
	fromWeb3JsPublicKey,
	toWeb3JsInstruction,
} from "@metaplex-foundation/umi-web3js-adapters";

export function transferNFT(): Plugin<SolanaWalletClient> {
	return {
		name: "transfer_nft",
		supportsSmartWallets: () => true,
		supportsChain: (chain) => chain.type === "solana",
		getTools: async () => {
			return [
				{
					name: "transfer_nft",
					description:
						"This {{tool}} sends an NFT from your wallet to an address on a Solana chain.",
					parameters: transferNFTParametersSchema,
					method: transferNFTMethod,
				},
			];
		},
	};
}

const transferNFTParametersSchema = z.object({
	recipientAddress: z.string().describe("The address to send the NFT to"),
	assetId: z.string().describe("The asset ID of the NFT to send"),
});

async function transferNFTMethod(
	walletClient: SolanaWalletClient,
	parameters: z.infer<typeof transferNFTParametersSchema>,
): Promise<string> {
	const { recipientAddress, assetId } = parameters;
	const umi = createUmi(walletClient.connection);
	umi.use(mplBubblegum());
	const assetWithProof = await getAssetWithProof(
		umi,
		fromWeb3JsPublicKey(new PublicKey(assetId)),
	);
	const instructions = transfer(umi, {
		...assetWithProof,
		leafOwner: fromWeb3JsPublicKey(new PublicKey(walletClient.getAddress())),
		newLeafOwner: fromWeb3JsPublicKey(new PublicKey(recipientAddress)),
	}).getInstructions();

	const result = await walletClient.sendTransaction({
		instructions: instructions.map(toWeb3JsInstruction),
	});

	return result.hash;
}
