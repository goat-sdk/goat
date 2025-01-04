import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTransactionTools } from '../transactions';
import type { ToolBase } from '@goat-sdk/core';
import { mockWalletClient } from './setup';

type BirdEyeTool = ToolBase;

describe('Transaction Tools', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('birdeye_get_defi_token_txs should fetch token transactions', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            hash: '0x123',
            timestamp: 1234567890,
            value: '1000000',
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const tools = getTransactionTools(mockWalletClient, { apiKey: 'test-api-key' });
    const txTool = tools.find(t => t.name === 'birdeye_get_defi_token_txs') as BirdEyeTool;
    expect(txTool).toBeDefined();

    const result = await txTool.execute({
      address: '0x123',
      chain_id: 1,
      limit: 100,
    });

    expect(result).toEqual(mockResponse.data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/defi/txs/token'),
      expect.any(Object)
    );
  });

  test('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    const tools = getTransactionTools(mockWalletClient, { apiKey: 'test-api-key' });
    const txTool = tools.find(t => t.name === 'birdeye_get_defi_token_txs') as BirdEyeTool;
    expect(txTool).toBeDefined();

    await expect(txTool.execute({
      address: '0x123',
      chain_id: 1,
      limit: 100,
    })).rejects.toThrow('API request failed');
  });
});
