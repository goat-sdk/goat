/**
          _____                    _____                    _____                    _____           _______                   _____          
         /\    \                  /\    \                  /\    \                  /\    \         /::\    \                 /\    \         
        /::\    \                /::\    \                /::\    \                /::\____\       /::::\    \               /:::\____\        
       /::::\    \               \:::\    \              /::::\    \              /:::/    /      /::::::\    \             /:::/    /        
      /::::::\    \               \:::\    \            /::::::\    \            /:::/    /      /::::::::\    \           /:::/   _/___      
     /:::/\:::\    \               \:::\    \          /:::/\:::\    \          /:::/    /      /:::/~~\:::\    \         /:::/   /\    \     
    /:::/__\:::\    \               \:::\    \        /:::/__\:::\    \        /:::/    /      /:::/    \:::\    \       /:::/   /::\____\    
   /::::\   \:::\    \              /::::\    \      /::::\   \:::\    \      /:::/    /      /:::/    / \:::\    \     /:::/   /:::/    /    
  /::::::\   \:::\    \    ____    /::::::\    \    /::::::\   \:::\    \    /:::/    /      /:::/____/   \:::\____\   /:::/   /:::/   _/___  
 /:::/\:::\   \:::\    \  /\   \  /:::/\:::\    \  /:::/\:::\   \:::\    \  /:::/    /      |:::|    |     |:::|    | /:::/___/:::/   /\    \ 
/:::/  \:::\   \:::\____\/::\   \/:::/  \:::\____\/:::/  \:::\   \:::\____\/:::/____/       |:::|____|     |:::|    ||:::|   /:::/   /::\____\
\::/    \:::\  /:::/    /\:::\  /:::/    \::/    /\::/    \:::\   \::/    /\:::\    \        \:::\    \   /:::/    / |:::|__/:::/   /:::/    /
 \/____/ \:::\/:::/    /  \:::\/:::/    / \/____/  \/____/ \:::\   \/____/  \:::\    \        \:::\    \ /:::/    /   \:::\/:::/   /:::/    /   
          \::::::/    /    \::::::/    /                    \:::\    \       \:::\    \        \:::\    /:::/    /     \::::::/   /:::/    /   
           \::::/    /      \::::/____/                      \:::\____\       \:::\    \        \:::\__/:::/    /       \::::/___/:::/    /   
           /:::/    /        \:::\    \                       \::/    /        \:::\    \        \::::::::/    /         \:::\__/:::/    /    
          /:::/    /          \:::\    \                       \/____/          \:::\____\        \::::::/    /           \::::::::/    /     
         /:::/    /            \:::\    \                                        \::/    /         ~~                      \::::/    /       
        \::/    /                \:::\____\                                        \/____/                                   ~~              
         \/____/                  \::/    /                                                                                                     
                                  \/____/                                                                                                     
*/

import { type Chain, PluginBase, PluginError } from '@goat-sdk/core';
import { HttpTransport } from './transport/http.transport';
import type {
    HyperliquidConfig,
    Meta,
    OrderRequest,
    OrderResponse,
    CancelOrderRequest,
    CancelOrderResponse,
    ClearingHouseState,
    MetaAndAssetCtxs,
    UserFunding,
    UserNonFundingLedgerUpdates,
    FundingHistory,
    UserOpenOrders,
    UserFills,
    UserRateLimit,
    OrderStatus,
    L2Book,
    CandleSnapshot
} from './types';
import { InfoType } from './types/constants';

const ARBITRUM_CHAIN_ID = 42161;

export class HyperliquidPlugin extends PluginBase {
    private readonly httpTransport: HttpTransport;
    private assetIndexCache = new Map<string, number>();

    constructor(config: HyperliquidConfig) {
        super('hyperliquid', []);
        this.httpTransport = new HttpTransport({
            baseUrl: config.baseUrl,
            privateKey: config.privateKey,
            walletAddress: config.walletAddress,
            isMainnet: config.network !== 'testnet'
        });
    }

    supportsChain = (chain: Chain) => chain.type === 'evm' && chain.id === ARBITRUM_CHAIN_ID;

    /**
     * Place an order on Hyperliquid
     * @param params Order parameters
     * @returns Order response
     */
    async placeOrder(params: OrderRequest): Promise<OrderResponse> {
        try {
            const orderAction = {
                type: 'order',
                orders: [{
                    a: await this.getAssetIndex(params.coin),
                    b: params.is_buy,
                    p: params.limit_px.toString(),
                    s: params.sz.toString(),
                    r: params.reduce_only ?? false,
                    t: params.order_type ?? { limit: { tif: 'Gtc' } }
                }],
                grouping: 'na'
            };

            return await this.httpTransport.exchangeRequest<OrderResponse>(orderAction, null);
        } catch (error) {
            throw new PluginError(`Failed to place order: ${(error as Error).message}`);
        }
    }

    /**
     * Cancel an order on Hyperliquid
     * @param params Cancel order parameters
     * @returns Cancel order response
     */
    async cancelOrder(params: CancelOrderRequest): Promise<CancelOrderResponse> {
        try {
            const cancelAction = {
                type: 'cancel',
                cancels: [{
                    a: await this.getAssetIndex(params.coin),
                    o: params.order_id
                }]
            };

            return await this.httpTransport.exchangeRequest<CancelOrderResponse>(cancelAction, null);
        } catch (error) {
            throw new PluginError(`Failed to cancel order: ${(error as Error).message}`);
        }
    }

    /**
     * Get account position and balance information
     * @param address Wallet address
     * @returns Clearing house state
     */
    async getPosition(address: string): Promise<ClearingHouseState> {
        try {
            return await this.httpTransport.infoRequest<ClearingHouseState>({
                type: InfoType.CLEARINGHOUSE_STATE,
                user: address
            });
        } catch (error) {
            throw new PluginError(`Failed to get position: ${(error as Error).message}`);
        }
    }

    /**
     * Get market meta information
     * @returns Meta information
     */
    async getMeta(): Promise<Meta> {
        try {
            return await this.httpTransport.infoRequest<Meta>({
                type: InfoType.META
            });
        } catch (error) {
            throw new PluginError(`Failed to get meta info: ${(error as Error).message}`);
        }
    }

    /**
     * Get meta information and asset contexts
     * @returns Meta and asset contexts
     */
    async getMetaAndAssetCtxs(): Promise<MetaAndAssetCtxs> {
        try {
            return await this.httpTransport.infoRequest<MetaAndAssetCtxs>({
                type: InfoType.PERPS_META_AND_ASSET_CTXS
            });
        } catch (error) {
            throw new PluginError(`Failed to get meta and asset contexts: ${(error as Error).message}`);
        }
    }

    /**
     * Get user funding information
     * @param user User address
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @returns User funding information
     */
    async getUserFunding(user: string, startTime: number, endTime?: number): Promise<UserFunding> {
        try {
            return await this.httpTransport.infoRequest<UserFunding>({
                type: InfoType.USER_FUNDING,
                user,
                startTime,
                endTime
            });
        } catch (error) {
            throw new PluginError(`Failed to get user funding: ${(error as Error).message}`);
        }
    }

    /**
     * Get user non-funding ledger updates
     * @param user User address
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @returns User non-funding ledger updates
     */
    async getUserNonFundingLedgerUpdates(user: string, startTime: number, endTime?: number): Promise<UserNonFundingLedgerUpdates> {
        try {
            return await this.httpTransport.infoRequest<UserNonFundingLedgerUpdates>({
                type: InfoType.USER_NON_FUNDING_LEDGER_UPDATES,
                user,
                startTime,
                endTime
            });
        } catch (error) {
            throw new PluginError(`Failed to get user ledger updates: ${(error as Error).message}`);
        }
    }

    /**
     * Get funding history for a coin
     * @param coin Coin symbol
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @returns Funding history
     */
    async getFundingHistory(coin: string, startTime: number, endTime?: number): Promise<FundingHistory> {
        try {
            return await this.httpTransport.infoRequest<FundingHistory>({
                type: InfoType.FUNDING_HISTORY,
                coin,
                startTime,
                endTime
            });
        } catch (error) {
            throw new PluginError(`Failed to get funding history: ${(error as Error).message}`);
        }
    }

    /**
     * Get open orders for a user
     * @param user User address
     * @returns User open orders
     */
    async getUserOpenOrders(user: string): Promise<UserOpenOrders> {
        try {
            return await this.httpTransport.infoRequest<UserOpenOrders>({
                type: InfoType.OPEN_ORDERS,
                user
            });
        } catch (error) {
            throw new PluginError(`Failed to get user open orders: ${(error as Error).message}`);
        }
    }

    /**
     * Get user fills
     * @param user User address
     * @returns User fills
     */
    async getUserFills(user: string): Promise<UserFills> {
        try {
            return await this.httpTransport.infoRequest<UserFills>({
                type: InfoType.USER_FILLS,
                user
            });
        } catch (error) {
            throw new PluginError(`Failed to get user fills: ${(error as Error).message}`);
        }
    }

    /**
     * Get user rate limit
     * @param user User address
     * @returns User rate limit
     */
    async getUserRateLimit(user: string): Promise<UserRateLimit> {
        try {
            return await this.httpTransport.infoRequest<UserRateLimit>({
                type: InfoType.USER_RATE_LIMIT,
                user
            });
        } catch (error) {
            throw new PluginError(`Failed to get user rate limit: ${(error as Error).message}`);
        }
    }

    /**
     * Get order status
     * @param params Order status parameters
     * @returns Order status
     */
    async getOrderStatus(params: { oid: number; coin: string }): Promise<OrderStatus> {
        try {
            return await this.httpTransport.infoRequest<OrderStatus>({
                type: InfoType.ORDER_STATUS,
                ...params
            });
        } catch (error) {
            throw new PluginError(`Failed to get order status: ${(error as Error).message}`);
        }
    }

    /**
     * Get L2 orderbook for a coin
     * @param params Orderbook parameters
     * @returns L2 orderbook
     */
    async getL2Book(params: { coin: string }): Promise<L2Book> {
        try {
            return await this.httpTransport.infoRequest<L2Book>({
                type: InfoType.L2_BOOK,
                ...params
            });
        } catch (error) {
            throw new PluginError(`Failed to get L2 book: ${(error as Error).message}`);
        }
    }

    /**
     * Get candle snapshot for a coin
     * @param params Candle snapshot parameters
     * @returns Candle snapshot
     */
    async getCandleSnapshot(params: {
        coin: string;
        interval: string;
        startTime?: number;
        endTime?: number;
    }): Promise<CandleSnapshot> {
        try {
            return await this.httpTransport.infoRequest<CandleSnapshot>({
                type: InfoType.CANDLE_SNAPSHOT,
                ...params
            });
        } catch (error) {
            throw new PluginError(`Failed to get candle snapshot: ${(error as Error).message}`);
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
            throw new PluginError(`Unknown asset: ${symbol}`);
        }
        return index;
    }
}

export const hyperliquid = (config: HyperliquidConfig) => new HyperliquidPlugin(config);
