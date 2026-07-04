import { DesideMcpSdk, type DesideSigner } from "@desideapp/mcp-sdk";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import {
    GetUserInfoParameters,
    ListConversationsParameters,
    MarkDmReadParameters,
    NoParameters,
    ReadDmsParameters,
    SearchAgentsParameters,
    SendDmParameters,
} from "./parameters";
import { DesideOAuthTokens, DesidePluginOptions } from "./types";

function toSigner(walletClient: SolanaWalletClient): DesideSigner {
    return {
        getAddress() {
            return walletClient.getAddress();
        },
        async signMessage(message: string) {
            const signed = await walletClient.signMessage(message);
            return signed.signature;
        },
    };
}

export class DesideClient {
    private readonly sdk: DesideMcpSdk;
    readonly authStateByWallet: Map<string, DesideOAuthTokens>;

    constructor(options: DesidePluginOptions) {
        this.sdk = new DesideMcpSdk(options);
        this.authStateByWallet = (
            this.sdk as unknown as { authStateByWallet: Map<string, DesideOAuthTokens> }
        ).authStateByWallet;
    }

    async sendDm(walletClient: SolanaWalletClient, parameters: SendDmParameters) {
        return this.sdk.sendDm(toSigner(walletClient), parameters);
    }

    async readDms(walletClient: SolanaWalletClient, parameters: ReadDmsParameters) {
        return this.sdk.readDms(toSigner(walletClient), parameters);
    }

    async markDmRead(walletClient: SolanaWalletClient, parameters: MarkDmReadParameters) {
        return this.sdk.markDmRead(toSigner(walletClient), parameters);
    }

    async listConversations(walletClient: SolanaWalletClient, parameters: ListConversationsParameters) {
        return this.sdk.listConversations(toSigner(walletClient), parameters);
    }

    async getUserInfo(walletClient: SolanaWalletClient, parameters: GetUserInfoParameters) {
        return this.sdk.getUserInfo(toSigner(walletClient), parameters);
    }

    async getMyIdentity(walletClient: SolanaWalletClient, _parameters: NoParameters) {
        return this.sdk.getMyIdentity(toSigner(walletClient), {});
    }

    async searchAgents(walletClient: SolanaWalletClient, parameters: SearchAgentsParameters) {
        return this.sdk.searchAgents(toSigner(walletClient), parameters);
    }
}
