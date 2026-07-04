import { KyberswapPlugin } from "./kyberswap.plugin";

export { KyberswapPlugin };
export type { QuoteResult, SwapBuildResult, ZapBuildResult } from "./kyberswap.service";
export { GetQuoteParameters, SwapParameters, ZapInParameters } from "./parameters";

export const kyberswap = () => new KyberswapPlugin();
