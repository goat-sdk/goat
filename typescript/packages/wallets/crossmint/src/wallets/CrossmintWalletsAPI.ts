import type { CrossmintApiClient } from "@crossmint/common-sdk-base";
import type { EVMTypedData } from "@goat-sdk/wallet-evm";
import type { SupportedSmartWalletChains } from "../chains";

type CoreSignerType =
    | "evm-keypair"
    | "solana-keypair"
    | "webauthn"
    | "evm-fireblocks-custodial"
    | "solana-fireblocks-custodial"
    | "evm-keypair-session";

type AdminSigner = {
    type: CoreSignerType;
    address?: string;
    locator?: string;
};

////////////////////////////////////////////////////////////////////
// Create Wallet
////////////////////////////////////////////////////////////////////
interface CreateWalletRequest {
    type: "evm-smart-wallet" | "solana-custodial-wallet";
    config?: {
        adminSigner?: AdminSigner;
    };
    linkedUser?: string;
}

interface CreateWalletResponse {
    type: "evm-smart-wallet" | "solana-custodial-wallet";
    address: string;
    config: {
        adminSigner?: AdminSigner;
    };
    linkedUser?: string;
    createdAt: string;
}

////////////////////////////////////////////////////////////////////
// Get Wallet
////////////////////////////////////////////////////////////////////
interface GetWalletResponse extends CreateWalletResponse {}

////////////////////////////////////////////////////////////////////
// Create Transaction
////////////////////////////////////////////////////////////////////
interface TransactionApprovals {
    pending: Omit<ApprovalSubmission, "signature" | "submittedAt" | "metadata">[];
    submitted: ApprovalSubmission[];
    required?: number; // For multisig scenarios, tentative until we support
}

interface ApprovalSubmission {
    signer: string; // signing locator {type}:{id}
    message: string;
    submittedAt: string; // timestamp
    signature: string;
    metadata?: object; // additional data, user agent, etc
}

interface CreateTransactionRequest {
    params: TransactionParams;
}

interface CreateTransactionResponse {
    id: string;
    walletType: "evm-smart-wallet" | "solana-custodial-wallet";
    status: "awaiting-approval" | "pending" | "failed" | "success";
    approvals?: TransactionApprovals;
    params: TransactionParams;
    onChain?: {
        userOperation?: object;
        userOperationHash?: string;
        chain?: string;
        txId?: string;
    };
    createdAt: string;
}

interface Approval {
    signer: string;
    signature: string;
}

interface TransactionParams {
    calls?: Call[];
    chain?: string;
    signer?: string;
    transaction?: string;
    signers?: string[];
}

interface Call {
    to: string;
    value: string;
    data: string;
}

////////////////////////////////////////////////////////////////////
// Transaction Status
////////////////////////////////////////////////////////////////////
interface TransactionStatusResponse extends CreateTransactionResponse {}

////////////////////////////////////////////////////////////////////
// Submit Approval
////////////////////////////////////////////////////////////////////
interface SubmitApprovalRequest {
    approvals: {
        signer: string;
        signature: string;
    }[];
}

interface SubmitApprovalResponse extends CreateTransactionResponse {}

////////////////////////////////////////////////////////////////////
// Sign Message
////////////////////////////////////////////////////////////////////
interface SignMessageRequest {
    type: "evm-message" | "solana-message";
    params: {
        message: string;
        signer?: string;
        chain?: string;
    };
}

interface SignMessageResponse {
    id: string;
    walletType: "evm-smart-wallet" | "solana-custodial-wallet";
    status: string;
    outputSignature: string;
    approvals: TransactionApprovals;
    createdAt: string;
}

////////////////////////////////////////////////////////////////////
// Sign Typed Data
////////////////////////////////////////////////////////////////////
interface SignTypedDataRequest {
    type: "evm-typed-data";
    params: {
        typedData: EVMTypedData;
        chain?: string;
        signer: string;
    };
}

interface SignTypedDataResponse {
    id: string;
    type: "evm-typed-data";
    params: {
        typedData: EVMTypedData;
        chain?: string;
        signer: string;
    };
    status: string;
    createdAt: string;
    approvals: TransactionApprovals;
}

////////////////////////////////////////////////////////////////////
// Approve Signature
////////////////////////////////////////////////////////////////////
interface ApproveSignatureRequest {
    approvals: {
        signer: string;
        signature: string;
    }[];
}

interface ApproveSignatureResponse {
    id: string;
    walletType: "evm-smart-wallet" | "solana-custodial-wallet";
    status: string;
    outputSignature?: string;
    approvals: TransactionApprovals;
    createdAt: string;
}

////////////////////////////////////////////////////////////////////
// API
////////////////////////////////////////////////////////////////////

type APIResponse =
    | CreateWalletResponse
    | CreateTransactionResponse
    | GetWalletResponse
    | SubmitApprovalResponse
    | SignMessageResponse
    | SignTypedDataResponse
    | ApproveSignatureResponse;

export class CrossmintWalletsAPI {
    private baseUrl: string;
    private crossmintClient: CrossmintApiClient;

    constructor(crossmintClient: CrossmintApiClient) {
        this.crossmintClient = crossmintClient;
        this.baseUrl = `${crossmintClient.baseUrl}/api/v1-alpha2`;
    }

    /**
     * Makes an HTTP request to the Crossmint API.
     *
     * @param endpoint - The API endpoint (relative to baseUrl).
     * @param options - Fetch options including method, headers, and body.
     * @returns The parsed JSON response.
     * @throws An error if the response is not OK.
     */
    private async request<T extends APIResponse>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Set default headers and merge with any additional headers
        const headers = new Headers({
            ...this.crossmintClient.authHeaders,
            ...(options.headers || {}),
            "Content-Type": "application/json",
        });

        const response = await fetch(url, { ...options, headers });
        const responseBody = (await response.json()) as T;

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${JSON.stringify(responseBody)}`);
        }

        return responseBody;
    }

    public async createSmartWallet(adminSigner?: AdminSigner): Promise<CreateWalletResponse> {
        const endpoint = "/wallets";
        const payload: CreateWalletRequest = {
            type: "evm-smart-wallet",
            config: {
                adminSigner: adminSigner,
            },
        };

        return this.request<CreateWalletResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async createCustodialWallet(linkedUser: string): Promise<CreateWalletResponse> {
        const endpoint = "/wallets";
        const payload: CreateWalletRequest = {
            type: "solana-custodial-wallet",
            linkedUser: linkedUser,
        };

        return this.request<CreateWalletResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async getWallet(locator: string): Promise<GetWalletResponse> {
        const endpoint = `/wallets/${encodeURIComponent(locator)}`;
        return this.request<GetWalletResponse>(endpoint, {
            method: "GET",
        });
    }

    public async signMessageForCustodialWallet(locator: string, message: string): Promise<SignMessageResponse> {
        const endpoint = `/wallets/${encodeURIComponent(locator)}/signatures`;
        const payload: SignMessageRequest = {
            type: "solana-message",
            params: { message },
        };

        return this.request<SignMessageResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async signMessageForSmartWallet(
        walletAddress: string,
        message: string,
        chain: SupportedSmartWalletChains,
        signer?: string,
    ): Promise<SignMessageResponse> {
        const endpoint = `/wallets/${encodeURIComponent(walletAddress)}/signatures`;
        const payload: SignMessageRequest = {
            type: "evm-message",
            params: {
                message,
                signer,
                chain,
            },
        };

        return this.request<SignMessageResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async signTypedDataForSmartWallet(
        walletAddress: string,
        typedData: EVMTypedData,
        chain: SupportedSmartWalletChains,
        signer: string,
    ): Promise<SignTypedDataResponse> {
        const endpoint = `/wallets/${encodeURIComponent(walletAddress)}/signatures`;

        const payload: SignTypedDataRequest = {
            type: "evm-typed-data",
            params: {
                typedData,
                chain,
                signer,
            },
        };

        return this.request<SignTypedDataResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async checkSignatureStatus(signatureId: string, walletAddress: string): Promise<ApproveSignatureResponse> {
        const endpoint = `/wallets/${encodeURIComponent(walletAddress)}/signatures/${encodeURIComponent(signatureId)}`;
        return this.request<ApproveSignatureResponse>(endpoint, {
            method: "GET",
        });
    }

    public async approveSignatureForSmartWallet(
        signatureId: string,
        locator: string,
        signer: string,
        signature: string,
    ): Promise<ApproveSignatureResponse> {
        const endpoint = `/wallets/${encodeURIComponent(
            locator,
        )}/signatures/${encodeURIComponent(signatureId)}/approvals`;

        const payload: ApproveSignatureRequest = {
            approvals: [
                {
                    signer: signer,
                    signature: signature,
                },
            ],
        };

        return this.request<ApproveSignatureResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async createTransactionForCustodialWallet(
        locator: string,
        transaction: string,
    ): Promise<CreateTransactionResponse> {
        const endpoint = `/wallets/${encodeURIComponent(locator)}/transactions`;
        const payload: CreateTransactionRequest = {
            params: {
                transaction: transaction,
            },
        };

        return this.request<CreateTransactionResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async createTransactionForSmartWallet(
        walletAddress: string,
        calls: Call[],
        chain: SupportedSmartWalletChains,
        signer?: string,
    ): Promise<CreateTransactionResponse> {
        const endpoint = `/wallets/${encodeURIComponent(walletAddress)}/transactions`;
        const payload: CreateTransactionRequest = {
            params: {
                calls,
                chain,
                signer: `evm-keypair:${signer}`,
            },
        };

        return this.request<CreateTransactionResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async approveTransaction(
        locator: string,
        transactionId: string,
        approvals: Approval[],
    ): Promise<SubmitApprovalResponse> {
        const endpoint = `/wallets/${encodeURIComponent(
            locator,
        )}/transactions/${encodeURIComponent(transactionId)}/approvals`;

        const payload: SubmitApprovalRequest = {
            approvals,
        };

        return this.request<SubmitApprovalResponse>(endpoint, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    public async checkTransactionStatus(locator: string, transactionId: string): Promise<TransactionStatusResponse> {
        const endpoint = `/wallets/${encodeURIComponent(locator)}/transactions/${encodeURIComponent(transactionId)}`;

        return this.request<TransactionStatusResponse>(endpoint, {
            method: "GET",
        });
    }
}
