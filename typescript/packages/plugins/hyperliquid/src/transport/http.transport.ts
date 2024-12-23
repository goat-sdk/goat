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
         /:::/    /            \:::\    \                                        \:::\____\        \::::/    /             \::::::/    /      
        /:::/    /              \:::\    \                                        \::/    /         ~~                      \::/____/        
         \/____/                  \:::\____\                                        \/____/                                   ~~              
                                  \/____/                                                                                                     
*/

import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { PluginError } from '@goat-sdk/core';
import { ethers } from 'ethers';
import { encode } from '@msgpack/msgpack';

const PHANTOM_DOMAIN = {
    name: 'Exchange',
    version: '1',
    chainId: 1337,
    verifyingContract: '0x0000000000000000000000000000000000000000'
};

const AGENT_TYPES = {
    Agent: [
        { name: 'source', type: 'string' },
        { name: 'connectionId', type: 'bytes32' }
    ]
};

interface RequestMetadata {
    startTime: number;
}

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: RequestMetadata;
    }
}

interface HttpTransportConfig {
    baseUrl: string;
    timeout?: number;
    privateKey?: string;
    walletAddress?: string;
    isMainnet?: boolean;
}

export class HttpTransport {
    private readonly infoApi: AxiosInstance;
    private readonly exchangeApi: AxiosInstance;
    private readonly privateKey?: string;
    private readonly walletAddress?: string;
    private readonly isMainnet: boolean;

    constructor(config: HttpTransportConfig) {
        this.privateKey = config.privateKey;
        this.walletAddress = config.walletAddress;
        this.isMainnet = config.isMainnet ?? true;

        this.infoApi = axios.create({
            baseURL: `${config.baseUrl}/info`,
            timeout: config.timeout || 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.exchangeApi = axios.create({
            baseURL: `${config.baseUrl}/exchange`,
            timeout: config.timeout || 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors(this.infoApi);
        this.setupInterceptors(this.exchangeApi);
    }

    private async signL1Action(action: unknown, vaultAddress: string | null, nonce: number): Promise<{ r: string; s: string; v: number }> {
        if (!this.privateKey) {
            throw new PluginError('Private key is required for signing messages');
        }

        const wallet = new ethers.Wallet(this.privateKey);
        const msgPackBytes = encode(action);
        const additionalBytesLength = vaultAddress === null ? 9 : 29;
        const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
        data.set(msgPackBytes);
        const view = new DataView(data.buffer);
        view.setBigUint64(msgPackBytes.length, BigInt(nonce), false);
        
        if (vaultAddress === null) {
            view.setUint8(msgPackBytes.length + 8, 0);
        } else {
            view.setUint8(msgPackBytes.length + 8, 1);
            data.set(ethers.getBytes(vaultAddress), msgPackBytes.length + 9);
        }

        const hash = ethers.keccak256(data);
        const phantomAgent = { source: this.isMainnet ? 'a' : 'b', connectionId: hash };
        
        const signature = await wallet.signTypedData(
            PHANTOM_DOMAIN,
            AGENT_TYPES,
            phantomAgent
        );

        return ethers.Signature.from(signature);
    }

    private setupInterceptors(api: AxiosInstance): void {
        api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                config.metadata = { startTime: Date.now() };
                return config;
            }
        );

        api.interceptors.response.use(
            (response: AxiosResponse) => {
                const duration = Date.now() - (response.config.metadata?.startTime || 0);
                console.debug(`Request to ${response.config.url} completed in ${duration}ms`);
                return response;
            },
            (error: AxiosError) => {
                if (error.response) {
                    const duration = Date.now() - (error.config?.metadata?.startTime || 0);
                    console.debug(`Request to ${error.config?.url} failed in ${duration}ms`);
                }
                return Promise.reject(error);
            }
        );
    }

    public async infoRequest<T>(params: Record<string, any> = {}): Promise<T> {
        try {
            const response = await this.infoApi.post<T>('', params);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new PluginError(`Info API request failed: ${error.message}`);
            }
            throw new PluginError(`Unexpected error during info request: ${(error as Error).message}`);
        }
    }

    public async exchangeRequest<T>(action: Record<string, any>, vaultAddress: string | null = null): Promise<T> {
        try {
            if (!this.privateKey) {
                throw new PluginError('Private key is required for exchange requests');
            }

            const nonce = Date.now();
            const signature = await this.signL1Action(action, vaultAddress, nonce);

            const request = {
                action,
                nonce,
                signature,
                vaultAddress
            };

            const response = await this.exchangeApi.post<T>('', request);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new PluginError(`Exchange API request failed: ${error.message}`);
            }
            throw new PluginError(`Unexpected error during exchange request: ${(error as Error).message}`);
        }
    }
}
