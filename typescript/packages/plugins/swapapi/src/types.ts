export interface SwapAPIServiceParams {
    baseUrl?: string;
}

export interface SwapAPITokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
}

export interface SwapAPITx {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: number;
}

export interface SwapAPIQuoteResponse {
    status: "Successful" | "Partial" | "NoRoute";
    amountIn: string;
    expectedAmountOut: string;
    minAmountOut: string;
    priceImpact: number;
    tokenFrom: SwapAPITokenInfo;
    tokenTo: SwapAPITokenInfo;
    tx: SwapAPITx;
}
