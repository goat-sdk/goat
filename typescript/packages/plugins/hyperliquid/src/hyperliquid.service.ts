import { Tool } from '@goat-sdk/core';
import { HttpTransport } from './transport/http.transport';
import { WebSocketTransport } from './transport/ws.transport';
import type { HyperliquidConfig } from './types';
import { InfoType, ExchangeType } from './types/constants';
import {
    AllMids,
    UserOpenOrders,
    FrontendOpenOrders,
    UserFills,
    UserRateLimit,
    OrderStatus,
    L2Book,
    CandleSnapshot,
    Meta,
    Order,
    OrderRequest,
    OrderResponse,
    CancelOrderRequest,
    CancelOrderResponse,
    ClearingHouseState,
    MetaAndAssetCtxs,
    UserFunding,
    UserNonFundingLedgerUpdates,
    FundingHistory
} from './types/api';

function floatToWire(x: number): string {
    const rounded = x.toFixed(8);
    if (Math.abs(parseFloat(rounded) - x) >= 1e-12) {
        throw new Error(`floatToWire causes rounding: ${x}`);
    }
    let normalized = rounded.replace(/\.?0+$/, '');
    if (normalized === '-0') normalized = '0';
    return normalized;
}

function orderToWire(order: Order, assetIndex: number) {
    return {
        a: assetIndex,
        b: order.is_buy,
        p: floatToWire(order.limit_px),
        s: floatToWire(order.sz),
        r: order.reduce_only ?? false,
        t: order.order_type ?? { limit: { tif: 'Gtc' } }
    };
}

function orderWireToAction(orderWires: any[], grouping: string = 'na', builder: any = undefined) {
    return {
        type: ExchangeType.ORDER,
        orders: orderWires,
        grouping,
        ...(builder && { builder })
    };
}

export class HyperliquidService {
    private readonly httpTransport: HttpTransport;
    private readonly wsTransport: WebSocketTransport;
    private assetIndexCache = new Map<string, number>();

    constructor(config: HyperliquidConfig) {
        this.httpTransport = new HttpTransport({
            baseUrl: config.baseUrl,
            privateKey: config.privateKey,
            walletAddress: config.walletAddress,
            isMainnet: config.network !== 'testnet'
        });
        this.wsTransport = new WebSocketTransport(config);
    }

    private validatePublicKey(publicKey: string): void {
        if (!publicKey) {
            throw new Error('Public Key is required!');
        }
    }

    private async getAssetIndex(symbol: string): Promise<number> {
        let index = this.assetIndexCache.get(symbol);
        if (index === undefined) {
            const meta = await this.getMeta();
            for (let i = 0; i < meta.universe.length; i++) {
                if (meta.universe[i].name === symbol) {
                    index = i;
                    this.assetIndexCache.set(symbol, i);
                    break;
                }
            }
        }
        if (index === undefined) {
            throw new Error(`Unknown asset: ${symbol}`);
        }
        return index;
    }

    @Tool({
        description: 'Place an order'
    })
    async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
        const { orders, vault_address = null, grouping = 'na', builder } = orderRequest;
        const ordersArray = orders ?? [orderRequest];

        const orderWires = await Promise.all(
            ordersArray.map(async (o) => {
                const assetIndex = await this.getAssetIndex(o.coin);
                return orderToWire(o, assetIndex);
            })
        );

        const action = orderWireToAction(orderWires, grouping, builder);
        return await this.httpTransport.exchangeRequest<OrderResponse>(action, vault_address);
    }

    @Tool({
        description: 'Cancel orders'
    })
    async cancelOrders(cancelRequests: CancelOrderRequest | CancelOrderRequest[]): Promise<CancelOrderResponse> {
        const cancels = Array.isArray(cancelRequests) ? cancelRequests : [cancelRequests];

        const cancelsWithIndices = await Promise.all(
            cancels.map(async (req) => ({
                a: await this.getAssetIndex(req.coin),
                o: req.order_id
            }))
        );

        const action = {
            type: ExchangeType.CANCEL,
            cancels: cancelsWithIndices
        };

        return await this.httpTransport.exchangeRequest<CancelOrderResponse>(action, null);
    }

    @Tool({
        description: 'Get clearing house state'
    })
    async getClearingHouseState(address: string): Promise<ClearingHouseState> {
        return await this.httpTransport.infoRequest<ClearingHouseState>({
            type: InfoType.CLEARINGHOUSE_STATE,
            user: address
        });
    }

    @Tool({
        description: 'Get meta information and asset contexts'
    })
    async getMetaAndAssetCtxs(): Promise<MetaAndAssetCtxs> {
        return await this.httpTransport.infoRequest<MetaAndAssetCtxs>({
            type: InfoType.PERPS_META_AND_ASSET_CTXS
        });
    }

    @Tool({
        description: 'Get user funding information'
    })
    async getUserFunding(user: string, startTime: number, endTime?: number): Promise<UserFunding> {
        return await this.httpTransport.infoRequest<UserFunding>({
            type: InfoType.USER_FUNDING,
            user,
            startTime,
            endTime
        });
    }

    @Tool({
        description: 'Get user non-funding ledger updates'
    })
    async getUserNonFundingLedgerUpdates(user: string, startTime: number, endTime?: number): Promise<UserNonFundingLedgerUpdates> {
        return await this.httpTransport.infoRequest<UserNonFundingLedgerUpdates>({
            type: InfoType.USER_NON_FUNDING_LEDGER_UPDATES,
            user,
            startTime,
            endTime
        });
    }

    @Tool({
        description: 'Get funding history for a coin'
    })
    async getFundingHistory(coin: string, startTime: number, endTime?: number): Promise<FundingHistory> {
        return await this.httpTransport.infoRequest<FundingHistory>({
            type: InfoType.FUNDING_HISTORY,
            coin,
            startTime,
            endTime
        });
    }

    @Tool({
        description: 'Get all mids for all coins'
    })
    async getAllMids(): Promise<AllMids> {
        return await this.httpTransport.infoRequest<AllMids>({
            type: InfoType.ALL_MIDS
        });
    }

    @Tool({
        description: 'Get meta information about all markets'
    })
    async getMeta(): Promise<Meta> {
        return await this.httpTransport.infoRequest<Meta>({
            type: InfoType.META
        });
    }

    @Tool({
        description: 'Get open orders for a user'
    })
    async getUserOpenOrders(userPublicKey: string): Promise<UserOpenOrders> {
        this.validatePublicKey(userPublicKey);
        return await this.httpTransport.infoRequest<UserOpenOrders>({
            type: InfoType.OPEN_ORDERS,
            user: userPublicKey
        });
    }

    @Tool({
        description: 'Get frontend-formatted open orders for a user'
    })
    async getFrontendOpenOrders(userPublicKey: string): Promise<FrontendOpenOrders> {
        this.validatePublicKey(userPublicKey);
        return await this.httpTransport.infoRequest<FrontendOpenOrders>({
            type: InfoType.FRONTEND_OPEN_ORDERS,
            user: userPublicKey
        });
    }

    @Tool({
        description: 'Get fills for a user'
    })
    async getUserFills(userPublicKey: string): Promise<UserFills> {
        this.validatePublicKey(userPublicKey);
        return await this.httpTransport.infoRequest<UserFills>({
            type: InfoType.USER_FILLS,
            user: userPublicKey
        });
    }

    @Tool({
        description: 'Get fills for a user within a time range'
    })
    async getUserFillsByTime(
        userPublicKey: string,
        startTime: number,
        endTime?: number
    ): Promise<UserFills> {
        this.validatePublicKey(userPublicKey);
        return await this.httpTransport.infoRequest<UserFills>({
            type: InfoType.USER_FILLS_BY_TIME,
            user: userPublicKey,
            startTime,
            endTime
        });
    }

    @Tool({
        description: 'Get rate limit info for a user'
    })
    async getUserRateLimit(userPublicKey: string): Promise<UserRateLimit> {
        this.validatePublicKey(userPublicKey);
        return await this.httpTransport.infoRequest<UserRateLimit>({
            type: InfoType.USER_RATE_LIMIT,
            user: userPublicKey
        });
    }

    @Tool({
        description: 'Get status of an order'
    })
    async getOrderStatus(params: { oid: number; coin: string }): Promise<OrderStatus> {
        return await this.httpTransport.infoRequest<OrderStatus>({
            type: InfoType.ORDER_STATUS,
            ...params
        });
    }

    @Tool({
        description: 'Get L2 orderbook for a coin'
    })
    async getL2Book(params: { coin: string }): Promise<L2Book> {
        return await this.httpTransport.infoRequest<L2Book>({
            type: InfoType.L2_BOOK,
            ...params
        });
    }

    @Tool({
        description: 'Get candle snapshot for a coin'
    })
    async getCandleSnapshot(params: {
        coin: string;
        interval: string;
        startTime?: number;
        endTime?: number;
    }): Promise<CandleSnapshot> {
        return await this.httpTransport.infoRequest<CandleSnapshot>({
            type: InfoType.CANDLE_SNAPSHOT,
            ...params
        });
    }

    // WebSocket methods
    async subscribeOrderbook(coin: string): Promise<void> {
        await this.wsTransport.subscribe('l2Book', { coin });
    }

    async unsubscribeOrderbook(coin: string): Promise<void> {
        await this.wsTransport.unsubscribe('l2Book', { coin });
    }

    async closeWebSocket(): Promise<void> {
        await this.wsTransport.close();
    }
}
