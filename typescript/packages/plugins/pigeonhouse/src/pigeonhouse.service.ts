import { Tool } from "@goat-sdk/core";
import {
  GetTokensParameters,
  GetTokenInfoParameters,
  GetTradesParameters,
  CalculatePriceParameters,
} from "./parameters";

const API_BASE = "https://941pigeon.fun";

export class PigeonHouseService {
  @Tool({
    description:
      "Get all active tokens on PigeonHouse with bonding curve data, prices, and market caps. PigeonHouse is a deflationary token launchpad on Solana where every trade burns PIGEON.",
  })
  async getTokens(parameters: GetTokensParameters) {
    const res = await fetch(`${API_BASE}/api/platform`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.tokens || [];
  }

  @Tool({
    description:
      "Get detailed bonding curve state for a specific token on PigeonHouse including price, reserves, graduation progress, and creator.",
  })
  async getTokenInfo(parameters: GetTokenInfoParameters) {
    const res = await fetch(`${API_BASE}/api/token/${parameters.tokenMint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const curve = data.curve || {};
    const config = data.config || {};

    const vp = Number(curve.virtualPigeonReserves || 0) / 1e6;
    const vt = Number(curve.virtualTokenReserves || 0) / 1e6;
    const rp = Number(curve.realPigeonReserves || 0) / 1e6;
    const gradThreshold = Number(config.graduationPigeonAmount || 0) / 1e6;

    return {
      name: curve.name,
      symbol: curve.symbol,
      mint: curve.tokenMint,
      creator: curve.creator,
      price: vt > 0 ? vp / vt : 0,
      realPigeonReserves: rp,
      graduated: curve.complete,
      graduationProgress: gradThreshold > 0 ? (rp / gradThreshold) * 100 : 0,
      totalBurned: Number(config.totalPigeonBurned || 0) / 1e6,
    };
  }

  @Tool({
    description: "Get recent trades for a token on PigeonHouse with price, amount, and direction.",
  })
  async getTrades(parameters: GetTradesParameters) {
    const res = await fetch(`${API_BASE}/api/trades/${parameters.tokenMint}?limit=${parameters.limit}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.trades || [];
  }

  @Tool({
    description:
      "Get PigeonHouse platform burn statistics: total PIGEON burned, tokens launched, and graduation threshold.",
  })
  async getBurnStats(parameters: GetTokensParameters) {
    const res = await fetch(`${API_BASE}/api/token/DRQwGjEAnQKAbzm7VwcXwsR1MWXhnLuCxT5KHgq7Tsyj`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const config = data.config || {};
    return {
      totalPigeonBurned: Number(config.totalPigeonBurned || 0) / 1e6,
      totalTokensLaunched: config.totalTokensLaunched,
      graduationThreshold: Number(config.graduationPigeonAmount || 0) / 1e6,
      platformFeeBps: config.platformFeeBps,
    };
  }

  @Tool({
    description:
      "Calculate expected output for a buy or sell on a PigeonHouse bonding curve. Uses constant product formula with 2% fee.",
  })
  async calculatePrice(parameters: CalculatePriceParameters) {
    const res = await fetch(`${API_BASE}/api/token/${parameters.tokenMint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const curve = data.curve || {};
    const vp = Number(curve.virtualPigeonReserves || 0);
    const vt = Number(curve.virtualTokenReserves || 0);
    const feeBps = 200;

    if (parameters.direction === "buy") {
      const quoteIn = parameters.amount * 1e6;
      const fee = (quoteIn * feeBps) / 10000;
      const net = quoteIn - fee;
      const tokensOut = (vt * net) / (vp + net);
      return {
        direction: "buy",
        quoteIn: parameters.amount,
        fee: fee / 1e6,
        tokensOut: tokensOut / 1e6,
        burnAmount: (fee * 0.75) / 1e6,
      };
    } else {
      const tokenIn = parameters.amount * 1e6;
      const quoteOut = (vp * tokenIn) / (vt + tokenIn);
      const fee = (quoteOut * feeBps) / 10000;
      return {
        direction: "sell",
        tokensIn: parameters.amount,
        quoteOut: (quoteOut - fee) / 1e6,
        fee: fee / 1e6,
        burnAmount: (fee * 0.75) / 1e6,
      };
    }
  }
}
