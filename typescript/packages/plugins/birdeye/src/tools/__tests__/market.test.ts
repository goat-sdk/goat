import { describe, test, expect } from 'vitest';
import { getMarketTools } from '../market';
import type { ToolBase } from '@goat-sdk/core';
import { mockWalletClient } from './setup';

type BirdEyeTool = ToolBase;

describe('Market Tools', () => {

  test('birdeye_get_defi_ohlcv should fetch OHLCV data for a token', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            unixTime: 1234567890,
            price: '1.23',
            volume: '1000000',
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const tools = getMarketTools(mockWalletClient, { apiKey: 'test-api-key' });
    const ohlcvTool = tools.find(t => t.name === 'birdeye_get_defi_ohlcv') as BirdEyeTool;
    expect(ohlcvTool).toBeDefined();

    const result = await ohlcvTool.execute({
      address: '0x123',
      chain_id: 1,
      timeframe: '1H',
      limit: 100,
    });

    expect(result).toEqual(mockResponse.data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/defi/ohlcv'),
      expect.any(Object)
    );
  });

  test('birdeye_get_ohlcv_pair should fetch OHLCV data for a pair', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            unixTime: 1234567890,
            price: '1.23',
            volume: '1000000',
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });


    const tools = getMarketTools(mockWalletClient, { apiKey: 'test-api-key' });
    const ohlcvTool = tools.find(t => t.name === 'birdeye_get_ohlcv_pair') as BirdEyeTool;
    expect(ohlcvTool).toBeDefined();

    const result = await ohlcvTool.execute({
      pair_address: '0x123',
      chain_id: 1,
      timeframe: '1H',
      limit: 100,
    });

    expect(result).toEqual(mockResponse.data);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/defi/ohlcv/pair'),
      expect.any(Object)
    );
  });

  test('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const tools = getMarketTools(mockWalletClient, { apiKey: 'test-api-key' });
    const ohlcvTool = tools.find(t => t.name === 'birdeye_get_defi_ohlcv') as BirdEyeTool;
    expect(ohlcvTool).toBeDefined();

    await expect(ohlcvTool.execute({
      address: '0x123',
      chain_id: 1,
      timeframe: '1H',
      limit: 100,
    })).rejects.toThrow('API request failed');
  });
});
