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
          /:::/    /          \:::\    \                       \/____/          \:::\    \        \::::::/    /           \::::::::/    /     
         /:::/    /            \:::\    \                                        \:::\    \        \::::/    /             \::::::/    /      
        /:::/    /              \:::\    \                                        \:::\____\        \::/____/               \::::/    /       
        \::/    /                \:::\____\                                        \::/    /         ~~                      \::/____/        
         \/____/                  \::/    /                                         \/____/                                   ~~              
                                  \/____/                                                                                                     
*/

/**
 * Hyperliquid Plugin for GOAT SDK
 * @module @goat-sdk/plugin-hyperliquid
 */

// Core exports
export { HyperliquidService } from './hyperliquid.service';
export { HyperliquidPlugin } from './hyperliquid.plugin';

// Type exports
export type {
    HyperliquidConfig,
    WebSocketTransportConfig,
    HttpTransportConfig
} from './types';

export type {
    OrderType,
    TimeInForce
} from './types/constants';

export type {
    OrderSide,
    ApiOrderType,
    Tif,
    TriggerType,
    LimitOrder,
    TriggerOrder,
    Grouping,
    Cloid,
    OidOrCloid,
    Order,
    BaseOrder,
    Builder,
    AllMids,
    Meta,
    UserOpenOrders,
    FrontendOpenOrders,
    UserFills,
    UserRateLimit,
    OrderStatus,
    L2Book,
    CandleSnapshot,
    WebSocketMessage
} from './types/api';

// Transport exports
export * from './transport';

// Error exports
export * from './errors';

// Auth exports
export * from './auth';
