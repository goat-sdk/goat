// import { HyperlaneContractsMap } from "@hyperlane-xyz/sdk";

export type WarpRouteToken = {
    chainName: string;
    name: string;
    symbol: string;
    decimals: number;
    standard: string;
    addressOrDenom: string | null;
    collateralAddressOrDenom?: string | null;
    connections?: Array<{ token: string }>;
};

export type WarpRouteConfig = {
    tokens: WarpRouteToken[];
};

export type WarpRoutes = Record<string, WarpRouteConfig>;

// export type DeployWarpRouteResponse = HyperlaneContractsMap<{
//     synthetic: HypERC20__factory;
//     collateral: HypERC20Collateral__factory;
//     collateralVault: HypERC4626OwnerCollateral__factory;
//     collateralVaultRebase: HypERC4626Collateral__factory;
//     syntheticRebase: HypERC4626__factory;
//     collateralFiat: HypFiatToken__factory;
//     xERC20: HypXERC20__factory;
//     xERC20Lockbox: HypXERC20Lockbox__factory;
//     native: HypNative__factory;
//     nativeScaled: HypNative__factory;
//     } & HyperlaneFactories & {
//         proxyAdmin: ProxyAdmin__factory;
//         timelockController: TimelockController__factory;
// }>
