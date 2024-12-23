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

import { PluginError } from '@goat-sdk/core';

/** Base error class for Hyperliquid plugin. */
export class HyperliquidError extends PluginError {
    constructor(message: string, cause?: Error) {
        super('HYPERLIQUID', message, cause);
    }
}

/** Error class for HTTP transport errors. */
export class HttpError extends HyperliquidError {
    constructor(
        public readonly status: number,
        public readonly statusText: string,
        public readonly url: string,
        public readonly body?: unknown
    ) {
        super(
            `HTTP ${status} ${statusText} for ${url}${
                body ? `: ${JSON.stringify(body)}` : ''
            }`
        );
    }
}

/** Error class for WebSocket transport errors. */
export class WebSocketError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`WebSocket error: ${message}`, cause);
    }
}

/** Error class for authentication errors. */
export class AuthError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Authentication error: ${message}`, cause);
    }
}

/** Error class for validation errors. */
export class ValidationError extends HyperliquidError {
    constructor(message: string) {
        super(`Validation error: ${message}`);
    }
}

/** Error class for rate limit errors. */
export class RateLimitError extends HyperliquidError {
    constructor(
        public readonly retryAfter?: number,
        public readonly limit?: number,
        public readonly remaining?: number
    ) {
        super(
            `Rate limit exceeded${
                retryAfter ? `, retry after ${retryAfter}s` : ''
            }`
        );
    }
}

/** Error class for timeout errors. */
export class TimeoutError extends HyperliquidError {
    constructor(public readonly timeoutMs: number) {
        super(`Request timed out after ${timeoutMs}ms`);
    }
}

/** Error class for connection errors. */
export class ConnectionError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Connection error: ${message}`, cause);
    }
}

/** Error class for subscription errors. */
export class SubscriptionError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Subscription error: ${message}`, cause);
    }
}

/** Error class for order errors. */
export class OrderError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Order error: ${message}`, cause);
    }
}

/** Error class for position errors. */
export class PositionError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Position error: ${message}`, cause);
    }
}

/** Error class for margin errors. */
export class MarginError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Margin error: ${message}`, cause);
    }
}

/** Error class for withdrawal errors. */
export class WithdrawalError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Withdrawal error: ${message}`, cause);
    }
}

/** Error class for transfer errors. */
export class TransferError extends HyperliquidError {
    constructor(message: string, cause?: Error) {
        super(`Transfer error: ${message}`, cause);
    }
}
