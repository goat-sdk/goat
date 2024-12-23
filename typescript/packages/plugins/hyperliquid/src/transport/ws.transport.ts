import WebSocket from 'ws';
import type { WebSocketMessage } from '../types/api';
import type { HyperliquidConfig } from '../types';
import { WSS_URLS } from '../types/constants';

export class WebSocketTransport {
    private ws: WebSocket | null = null;
    private readonly wsUrl: string;

    constructor(config: HyperliquidConfig) {
        this.wsUrl = config.wsUrl || (config.network === 'mainnet' ? WSS_URLS.PRODUCTION : WSS_URLS.TESTNET);
    }

    private async ensureConnection(): Promise<WebSocket> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.ws = new WebSocket(this.wsUrl);
            await new Promise((resolve, reject) => {
                if (!this.ws) return reject(new Error('WebSocket not initialized'));
                this.ws.on('open', resolve);
                this.ws.on('error', reject);
            });
        }
        return this.ws;
    }

    async subscribe<T = unknown>(channel: string, params?: Record<string, unknown>): Promise<void> {
        const ws = await this.ensureConnection();
        const message: WebSocketMessage<T> = {
            type: 'subscribe',
            channel,
            ...params
        };
        ws.send(JSON.stringify(message));
    }

    async unsubscribe<T = unknown>(channel: string, params?: Record<string, unknown>): Promise<void> {
        const ws = await this.ensureConnection();
        const message: WebSocketMessage<T> = {
            type: 'unsubscribe',
            channel,
            ...params
        };
        ws.send(JSON.stringify(message));
    }

    async close(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
