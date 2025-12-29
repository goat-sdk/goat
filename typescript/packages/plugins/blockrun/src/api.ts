import axios, { AxiosInstance, AxiosError } from "axios";
import { signTypedData, privateKeyToAccount } from "viem/accounts";
import type { Account } from "viem/accounts";

// x402 Constants
const BASE_CHAIN_ID = 8453;
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

const USDC_DOMAIN = {
    name: "USD Coin",
    version: "2",
    chainId: BASE_CHAIN_ID,
    verifyingContract: USDC_BASE,
} as const;

const TRANSFER_TYPES = {
    TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
    ],
} as const;

export interface BlockRunModel {
    id: string;
    name: string;
    provider: string;
    inputPrice: number;
    outputPrice: number;
    contextWindow: number;
    available: boolean;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatCompletionResponse {
    id: string;
    model: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface ImageGenerationResponse {
    created: number;
    data: {
        url: string;
        revised_prompt?: string;
    }[];
}

export interface BlockRunAPIClientOptions {
    baseUrl?: string;
    privateKey: `0x${string}`;
}

interface PaymentOption {
    scheme: string;
    network: string;
    amount?: string;
    maxAmountRequired?: string;
    asset: string;
    payTo: string;
    maxTimeoutSeconds?: number;
    extra?: { name?: string; version?: string };
}

interface PaymentRequired {
    accepts: PaymentOption[];
    resource?: { url?: string; description?: string };
}

function createNonce(): `0x${string}` {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
}

export class BlockRunAPIClient {
    private client: AxiosInstance;
    private baseUrl: string;
    private privateKey: `0x${string}`;
    private account: Account;

    constructor(opts: BlockRunAPIClientOptions) {
        if (!opts.privateKey) {
            throw new Error("privateKey is required for BlockRun x402 payments");
        }

        this.privateKey = opts.privateKey;
        this.account = privateKeyToAccount(opts.privateKey);
        this.baseUrl = opts.baseUrl || "https://blockrun.ai/api";

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    private async createPaymentPayload(
        recipient: string,
        amount: string,
        resourceUrl: string,
    ): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        const validAfter = now - 600;
        const validBefore = now + 300;
        const nonce = createNonce();

        const signature = await signTypedData({
            privateKey: this.privateKey,
            domain: USDC_DOMAIN,
            types: TRANSFER_TYPES,
            primaryType: "TransferWithAuthorization",
            message: {
                from: this.account.address,
                to: recipient as `0x${string}`,
                value: BigInt(amount),
                validAfter: BigInt(validAfter),
                validBefore: BigInt(validBefore),
                nonce,
            },
        });

        const paymentData = {
            x402Version: 2,
            resource: {
                url: resourceUrl,
                description: "BlockRun AI API call",
                mimeType: "application/json",
            },
            accepted: {
                scheme: "exact",
                network: "eip155:8453",
                amount,
                asset: USDC_BASE,
                payTo: recipient,
                maxTimeoutSeconds: 300,
                extra: { name: "USD Coin", version: "2" },
            },
            payload: {
                signature,
                authorization: {
                    from: this.account.address,
                    to: recipient,
                    value: amount,
                    validAfter: validAfter.toString(),
                    validBefore: validBefore.toString(),
                    nonce,
                },
            },
        };

        return Buffer.from(JSON.stringify(paymentData)).toString("base64");
    }

    private parsePaymentRequired(headerValue: string): PaymentRequired {
        const decoded = Buffer.from(headerValue, "base64").toString("utf-8");
        return JSON.parse(decoded);
    }

    private async requestWithPayment<T>(
        method: "get" | "post",
        endpoint: string,
        data?: Record<string, unknown>,
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = method === "get"
                ? await this.client.get(endpoint)
                : await this.client.post(endpoint, data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 402) {
                // Handle x402 payment
                let paymentHeader = error.response.headers["payment-required"];

                if (!paymentHeader) {
                    const respBody = error.response.data;
                    if (respBody?.x402 || respBody?.accepts) {
                        paymentHeader = Buffer.from(JSON.stringify(respBody)).toString("base64");
                    }
                }

                if (!paymentHeader) {
                    throw new Error("402 response but no payment requirements found");
                }

                const paymentRequired = this.parsePaymentRequired(paymentHeader);
                const option = paymentRequired.accepts[0];
                const amount = option.amount || option.maxAmountRequired;

                if (!amount) {
                    throw new Error("No amount in payment requirements");
                }

                const paymentPayload = await this.createPaymentPayload(
                    option.payTo,
                    amount,
                    url,
                );

                // Retry with payment
                const retryResponse = method === "get"
                    ? await this.client.get(endpoint, {
                        headers: { "PAYMENT-SIGNATURE": paymentPayload },
                    })
                    : await this.client.post(endpoint, data, {
                        headers: { "PAYMENT-SIGNATURE": paymentPayload },
                    });

                return retryResponse.data;
            }
            throw error;
        }
    }

    async chatCompletion(
        model: string,
        messages: ChatMessage[],
        options: {
            maxTokens?: number;
            temperature?: number;
        } = {},
    ): Promise<ChatCompletionResponse> {
        return this.requestWithPayment<ChatCompletionResponse>("post", "/v1/chat/completions", {
            model,
            messages,
            max_tokens: options.maxTokens || 1024,
            temperature: options.temperature || 0.7,
        });
    }

    async generateImage(
        model: string,
        prompt: string,
        options: {
            size?: string;
            n?: number;
        } = {},
    ): Promise<ImageGenerationResponse> {
        return this.requestWithPayment<ImageGenerationResponse>("post", "/v1/images/generations", {
            model,
            prompt,
            size: options.size || "1024x1024",
            n: options.n || 1,
        });
    }

    async getModels(): Promise<BlockRunModel[]> {
        const response = await this.client.get("/v1/models");
        return response.data.data || response.data;
    }

    getWalletAddress(): string {
        return this.account.address;
    }
}
