import { type Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { DragonswapService } from "./dragonswap.service";

export type DragonswapConfig = {
    routerAddress?: string;
    factoryAddress?: string;
    wseiAddress?: string;
    nonfungiblePositionManagerAddress?: string;
    quoterAddress?: string;
};

const DEFAULT_CONFIG: DragonswapConfig = {
    // Production environment (pacific-1) addresses
    routerAddress: "0x11DA6463D6Cb5a03411Dbf5ab6f6bc3997Ac7428", // SwapRouter02
    factoryAddress: "0x179D9a5592Bc77050796F7be28058c51cA575df4", // DragonswapV2Factory
    nonfungiblePositionManagerAddress: "0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70",
    quoterAddress: "0x38F759cf0Af1D0dcAEd723a3967A3B658738eDe9" // QuoterV2
};

export class DragonswapPlugin extends PluginBase<EVMWalletClient> {
    constructor(private readonly config: DragonswapConfig = DEFAULT_CONFIG) {
        super("dragonswap", [new DragonswapService(config)]);
    }

    supportsChain = (chain: Chain) => chain.type === "evm" ;
}

export function dragonswap(config?: DragonswapConfig) {
    return new DragonswapPlugin(config);
}
