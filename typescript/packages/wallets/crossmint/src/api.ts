import type { CrossmintApiClient } from "@crossmint/common-sdk-base";
import type { EVMTypedData } from "@goat-sdk/core";
import type { SupportedSmartWalletChains } from "./chains";

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
    pending: Omit<
        ApprovalSubmission,
        "signature" | "submittedAt" | "metadata"
    >[];
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

export function createCrossmintAPI(crossmintClient: CrossmintApiClient) {
    const baseUrl = `${crossmintClient.baseUrl}/api/v1-alpha2`;
    /**
     * Makes an HTTP request to the Crossmint API.
     *
     * @param endpoint - The API endpoint (relative to baseUrl).
     * @param options - Fetch options including method, headers, and body.
     * @returns The parsed JSON response.
     * @throws An error if the response is not OK.
     */
    const request = async (
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse> => {
        const url = `${baseUrl}${endpoint}`;

        // Set default headers and merge with any additional headers
        const headers = new Headers({
            ...crossmintClient.authHeaders,
            ...(options.headers || {}),
            "Content-Type": "application/json",
        });

        const response = await fetch(url, { ...options, headers });

        let responseBody: APIResponse;

        responseBody = await response.json();

        if (!response.ok) {
            throw new Error(
                `Error ${response.status}: ${JSON.stringify(responseBody)}`
            );
        }

        return responseBody;
    };

    return {
        createSmartWallet: async (
            adminSigner?: AdminSigner
        ): Promise<CreateWalletResponse> => {
            const endpoint = "/wallets";
            const payload = {
                type: "evm-smart-wallet",
                config: {
                    adminSigner: adminSigner,
                },
            } as CreateWalletRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as CreateWalletResponse;
        },
        createCustodialWallet: async (
            linkedUser: string
        ): Promise<CreateWalletResponse> => {
            const endpoint = "/wallets";
            const payload = {
                type: "solana-custodial-wallet",
                linkedUser: linkedUser,
            } as CreateWalletRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as CreateWalletResponse;
        },
        getWallet: async (locator: string): Promise<GetWalletResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(locator)}`;
            return (await request(endpoint, {
                method: "GET",
            })) as GetWalletResponse;
        },
        signMessageForCustodialWallet: async (
            locator: string,
            message: string
        ): Promise<SignMessageResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                locator
            )}/signatures`;

            const payload = {
                type: "solana-message",
                params: {
                    message: message,
                },
            } as SignMessageRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as SignMessageResponse;
        },
        signMessageForSmartWallet: async (
            walletAddress: string,
            message: string,
            chain: SupportedSmartWalletChains,
            signer?: string
        ): Promise<SignMessageResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                walletAddress
            )}/signatures`;

            const payload = {
                type: "evm-message",
                params: {
                    message: message,
                    signer: signer,
                    chain: chain,
                },
            } as SignMessageRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as SignMessageResponse;
        },
        signTypedDataForSmartWallet: async (
            walletAddress: string,
            typedData: EVMTypedData,
            chain: SupportedSmartWalletChains,
            signer?: string
        ): Promise<SignTypedDataResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                walletAddress
            )}/signatures`;

            const payload = {
                type: "evm-typed-data",
                params: {
                    typedData: typedData,
                    chain: chain,
                    signer: signer,
                },
            } as SignTypedDataRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as SignTypedDataResponse;
        },
        checkSignatureStatus: async (
            signatureId: string,
            walletAddress: string
        ): Promise<ApproveSignatureResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                walletAddress
            )}/signatures/${encodeURIComponent(signatureId)}`;

            return (await request(endpoint, {
                method: "GET",
            })) as ApproveSignatureResponse;
        },
        approveSignatureForSmartWallet: async (
            signatureId: string,
            locator: string,
            signer: string,
            signature: string
        ): Promise<ApproveSignatureResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                locator
            )}/signatures/${encodeURIComponent(signatureId)}/approvals`;

            const payload = {
                approvals: [
                    {
                        signer: signer,
                        signature: signature,
                    },
                ],
            } as ApproveSignatureRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as ApproveSignatureResponse;
        },
        createTransactionForCustodialWallet: async (
            locator: string,
            transaction: string
        ): Promise<CreateTransactionResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                locator
            )}/transactions`;
            const payload = {
                params: {
                    transaction: transaction,
                },
            } as CreateTransactionRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as CreateTransactionResponse;
        },
        createTransactionForSmartWallet: async (
            walletAddress: string,
            calls: Call[],
            chain: SupportedSmartWalletChains,
            signer?: string
        ): Promise<CreateTransactionResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                walletAddress
            )}/transactions`;
            const payload = {
                params: {
                    calls: calls,
                    chain: chain,
                    signer: `evm-keypair:${signer}`,
                },
            } as CreateTransactionRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as CreateTransactionResponse;
        },
        approveTransaction: async (
            locator: string,
            transactionId: string,
            approvals: Approval[]
        ): Promise<SubmitApprovalResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                locator
            )}/transactions/${encodeURIComponent(transactionId)}/approvals`;

            const payload = {
                approvals: approvals,
            } as SubmitApprovalRequest;

            return (await request(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            })) as SubmitApprovalResponse;
        },
        checkTransactionStatus: async (
            locator: string,
            transactionId: string
        ): Promise<TransactionStatusResponse> => {
            const endpoint = `/wallets/${encodeURIComponent(
                locator
            )}/transactions/${encodeURIComponent(transactionId)}`;

            return (await request(endpoint, {
                method: "GET",
            })) as TransactionStatusResponse;
        },
    };
}
