import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HyperliquidPlugin } from '../src/hyperliquid.plugin';
import type { Chain } from '@goat-sdk/core';

describe('HyperliquidPlugin', () => {
    const testConfig = {
        baseUrl: 'https://api.hyperliquid-testnet.xyz',
        privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
        walletAddress: '0x1234567890123456789012345678901234567890',
        network: 'testnet' as const
    };

    let plugin: HyperliquidPlugin;

    beforeEach(() => {
        plugin = new HyperliquidPlugin(testConfig);
    });

    describe('supportsChain', () => {
        it('should support Arbitrum chain', () => {
            const chain: Chain = {
                type: 'evm',
                id: 42161
            };
            expect(plugin.supportsChain(chain)).toBe(true);
        });

        it('should not support other chains', () => {
            const chain: Chain = {
                type: 'evm',
                id: 1
            };
            expect(plugin.supportsChain(chain)).toBe(false);
        });
    });

    describe('placeOrder', () => {
        it('should place an order correctly', async () => {
            const orderRequest = {
                coin: 'BTC',
                is_buy: true,
                sz: 0.1,
                limit_px: 50000,
                reduce_only: false
            };

            // Mock the httpTransport.exchangeRequest method
            vi.spyOn(plugin['httpTransport'], 'exchangeRequest').mockResolvedValue({
                status: 'ok',
                response: {
                    type: 'order',
                    data: {
                        statuses: [{
                            filled: {
                                totalSz: '0.1',
                                avgPx: '50000',
                                oid: 123
                            }
                        }]
                    }
                }
            });

            const response = await plugin.placeOrder(orderRequest);
            expect(response.status).toBe('ok');
            expect(response.response.type).toBe('order');
            expect(response.response.data.statuses[0].filled).toBeDefined();
        });
    });

    describe('cancelOrder', () => {
        it('should cancel an order correctly', async () => {
            const cancelRequest = {
                coin: 'BTC',
                order_id: 123
            };

            // Mock the httpTransport.exchangeRequest method
            vi.spyOn(plugin['httpTransport'], 'exchangeRequest').mockResolvedValue({
                status: 'ok',
                response: {
                    type: 'cancel',
                    data: {
                        statuses: [{}]
                    }
                }
            });

            const response = await plugin.cancelOrder(cancelRequest);
            expect(response.status).toBe('ok');
            expect(response.response.type).toBe('cancel');
        });
    });

    describe('getPosition', () => {
        it('should get position correctly', async () => {
            const address = '0x1234567890123456789012345678901234567890';

            // Mock the httpTransport.infoRequest method
            vi.spyOn(plugin['httpTransport'], 'infoRequest').mockResolvedValue({
                marginSummary: {
                    accountValue: '1000',
                    totalNtlPos: '0',
                    totalRawUsd: '1000',
                    totalMarginUsed: '0'
                },
                crossMarginSummary: {
                    accountValue: '1000',
                    totalNtlPos: '0',
                    totalRawUsd: '1000',
                    totalMarginUsed: '0'
                },
                crossMaintenanceMarginUsed: '0',
                withdrawable: '1000',
                assetPositions: [],
                time: Date.now()
            });

            const position = await plugin.getPosition(address);
            expect(position.marginSummary.accountValue).toBe('1000');
            expect(position.withdrawable).toBe('1000');
            expect(Array.isArray(position.assetPositions)).toBe(true);
        });
    });

    describe('getUserOpenOrders', () => {
        it('should get open orders correctly', async () => {
            const address = '0x1234567890123456789012345678901234567890';

            // Mock the httpTransport.infoRequest method
            vi.spyOn(plugin['httpTransport'], 'infoRequest').mockResolvedValue({
                orders: [{
                    coin: 'BTC',
                    is_buy: true,
                    sz: '0.1',
                    limit_px: '50000',
                    order_id: 123,
                    timestamp: Date.now()
                }]
            });

            const orders = await plugin.getUserOpenOrders(address);
            expect(Array.isArray(orders.orders)).toBe(true);
            expect(orders.orders[0].coin).toBe('BTC');
            expect(orders.orders[0].order_id).toBe(123);
        });
    });

    describe('getUserFills', () => {
        it('should get user fills correctly', async () => {
            const address = '0x1234567890123456789012345678901234567890';

            // Mock the httpTransport.infoRequest method
            vi.spyOn(plugin['httpTransport'], 'infoRequest').mockResolvedValue({
                fills: [{
                    coin: 'BTC',
                    is_buy: true,
                    sz: '0.1',
                    px: '50000',
                    order_id: 123,
                    timestamp: Date.now(),
                    fee: '0.1'
                }]
            });

            const fills = await plugin.getUserFills(address);
            expect(Array.isArray(fills.fills)).toBe(true);
            expect(fills.fills[0].coin).toBe('BTC');
            expect(fills.fills[0].order_id).toBe(123);
        });
    });
}); 