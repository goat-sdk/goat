import { beforeEach, afterEach, vi } from 'vitest';
import type { EVMWalletClient } from "@goat-sdk/wallet-evm";
import type { Chain } from "@goat-sdk/core";

export const mockWalletClient = {
  getChain: vi.fn().mockResolvedValue({ type: 'evm', id: 1 } as Chain),
  address: '0x123',
  chainId: 1,
  provider: {} as any,
  signer: {} as any
} as unknown as EVMWalletClient;

beforeEach(() => {
  global.fetch = vi.fn();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});
