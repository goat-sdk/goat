import { WalletClientBase } from "../../classes";
import { EvmChain } from "../../types/Chain";

/**
 * Creates a mock wallet client for testing
 */
export function mockWalletClient(): WalletClientBase {
  return {
    getAddress: () => "0xmockaddress",
    getChain: () => ({ type: "evm", id: 1 } as EvmChain),
    signMessage: async () => ({ signature: "0xmocksignature" }),
    balanceOf: async () => ({
      decimals: 18,
      symbol: "ETH",
      name: "Ethereum",
      value: "100",
      inBaseUnits: "100000000000000000000"
    }),
    getCoreTools: () => []
  } as WalletClientBase;
}
