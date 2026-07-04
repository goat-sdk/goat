import { Tool } from "@goat-sdk/core";
import { SolanaWalletClient } from "@goat-sdk/wallet-solana";
import { DesideClient } from "./deside.client";
import {
    GetUserInfoParameters,
    ListConversationsParameters,
    MarkDmReadParameters,
    NoParameters,
    ReadDmsParameters,
    SearchAgentsParameters,
    SendDmParameters,
} from "./parameters";
import { DesidePluginOptions } from "./types";

export class DesideService {
    private readonly client: DesideClient;

    constructor(options: DesidePluginOptions) {
        this.client = new DesideClient(options);
    }

    @Tool({
        name: "deside_send_dm",
        description: "Send a wallet-to-wallet DM through Deside MCP.",
    })
    async sendDm(walletClient: SolanaWalletClient, parameters: SendDmParameters) {
        return this.client.sendDm(walletClient, parameters);
    }

    @Tool({
        name: "deside_read_dms",
        description: "Read messages from a Deside DM conversation.",
    })
    async readDms(walletClient: SolanaWalletClient, parameters: ReadDmsParameters) {
        return this.client.readDms(walletClient, parameters);
    }

    @Tool({
        name: "deside_mark_dm_read",
        description: "Mark a Deside DM conversation as read up to a given sequence number.",
    })
    async markDmRead(walletClient: SolanaWalletClient, parameters: MarkDmReadParameters) {
        return this.client.markDmRead(walletClient, parameters);
    }

    @Tool({
        name: "deside_list_conversations",
        description: "List the authenticated wallet's Deside DM conversations.",
    })
    async listConversations(walletClient: SolanaWalletClient, parameters: ListConversationsParameters) {
        return this.client.listConversations(walletClient, parameters);
    }

    @Tool({
        name: "deside_get_user_info",
        description: "Get Deside public profile info for any Solana wallet.",
    })
    async getUserInfo(walletClient: SolanaWalletClient, parameters: GetUserInfoParameters) {
        return this.client.getUserInfo(walletClient, parameters);
    }

    @Tool({
        name: "deside_get_my_identity",
        description: "Inspect how Deside recognizes the authenticated wallet identity.",
    })
    async getMyIdentity(walletClient: SolanaWalletClient, parameters: NoParameters) {
        return this.client.getMyIdentity(walletClient, parameters);
    }

    @Tool({
        name: "deside_search_agents",
        description: "Search Deside's visible agent directory.",
    })
    async searchAgents(walletClient: SolanaWalletClient, parameters: SearchAgentsParameters) {
        return this.client.searchAgents(walletClient, parameters);
    }
}
