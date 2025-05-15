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
