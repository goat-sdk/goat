import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDefiTools } from '../defi';
import type { ToolBase } from '@goat-sdk/core';
import { mockWalletClient } from './setup';

type BirdEyeTool = ToolBase;

describe('DeFi Tools', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('birdeye_get_defi_price_volume_multi should fetch price and volume data', async () => {
    const mockResponse = {
      success: true,
      data: {
        '0x123': {
          price: '1.23',
          volume24h: '1000000',
        },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const tools = getDefiTools(mockWalletClient, { apiKey: 'test-api-key' });
    const priceVolumeTool = tools.find(t => t.name === 'birdeye_get_defi_price_volume_multi') as BirdEyeTool;
    expect(priceVolumeTool).toBeDefined();

    const result = await priceVolumeTool.execute({
      chain_id: 1,
      token_addresses: ['0x123'],
    });

    expect(result).toEqual(mockResponse.data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/defi/price_volume_multi'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      })
    );
  });

  test('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const tools = getDefiTools(mockWalletClient, { apiKey: 'test-api-key' });
    const priceVolumeTool = tools.find(t => t.name === 'birdeye_get_defi_price_volume_multi') as BirdEyeTool;
    expect(priceVolumeTool).toBeDefined();

    await expect(priceVolumeTool.execute({
      chain_id: 1,
      token_addresses: ['0x123'],
    })).rejects.toThrow('API request failed');
  });
});
