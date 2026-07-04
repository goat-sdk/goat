import { ToolBase, getTools } from "@goat-sdk/core";
import { DesideClient, deside } from "@goat-sdk/plugin-deside";
import { solana } from "@goat-sdk/wallet-solana";
import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

type SmokeOptions = {
    baseUrl: string;
    mcpPath: string;
    oauthClientName: string;
    oauthRedirectUri: string;
    signatureEncoding: "auto" | "base58" | "hex" | "base64";
};

function readRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function assert(condition: unknown, message: string, details?: unknown): asserts condition {
    if (condition) {
        return;
    }
    const suffix = details === undefined ? "" : ` details=${JSON.stringify(details)}`;
    throw new Error(`${message}${suffix}`);
}

function asErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

function getToolOrThrow(tools: ToolBase[], name: string): ToolBase {
    const tool = tools.find((entry: ToolBase) => entry.name === name);
    if (!tool) {
        throw new Error(`Missing required tool: ${name}`);
    }
    return tool;
}

function createSmokeOptions(): SmokeOptions {
    return {
        baseUrl: process.env.DESIDE_BASE_URL || "https://mcp.deside.io",
        mcpPath: process.env.DESIDE_MCP_PATH || "/mcp",
        oauthClientName: process.env.DESIDE_OAUTH_CLIENT_NAME || "goat-deside-smoke",
        oauthRedirectUri: readRequiredEnv("DESIDE_OAUTH_REDIRECT_URI"),
        signatureEncoding: (process.env.DESIDE_SIGNATURE_ENCODING || "auto") as "auto" | "base58" | "hex" | "base64",
    };
}

async function main() {
    const connection = new Connection(readRequiredEnv("SOLANA_RPC_URL"));
    const keypair = Keypair.fromSecretKey(base58.decode(readRequiredEnv("SOLANA_PRIVATE_KEY")));
    const wallet = solana({
        keypair,
        connection,
    });

    const smokeOptions = createSmokeOptions();
    const tools = await getTools({
        wallet,
        plugins: [deside(smokeOptions)],
    });

    const getIdentityTool = getToolOrThrow(tools, "deside_get_my_identity");
    const getUserInfoTool = getToolOrThrow(tools, "deside_get_user_info");
    const searchAgentsTool = getToolOrThrow(tools, "deside_search_agents");
    const listConversationsTool = getToolOrThrow(tools, "deside_list_conversations");
    const readDmsTool = getToolOrThrow(tools, "deside_read_dms");
    const markReadTool = getToolOrThrow(tools, "deside_mark_dm_read");
    const sendDmTool = getToolOrThrow(tools, "deside_send_dm");

    const peerWallet = readRequiredEnv("DESIDE_TO_WALLET");
    const listLimit = Number.parseInt(process.env.DESIDE_LIST_LIMIT || "10", 10);
    const sendText = process.env.DESIDE_TEXT || `Hello from GOAT Deside smoke @ ${new Date().toISOString()}`;
    const summary: Record<string, unknown> = {
        wallet: wallet.getAddress(),
        peerWallet,
        toolNames: tools.map((tool: ToolBase) => tool.name),
        skips: [],
    };

    const identity = (await getIdentityTool.execute({})) as Record<string, unknown>;
    assert(identity.wallet === wallet.getAddress(), "identity_wallet_mismatch", identity);
    summary.identity = identity;

    const userInfo = (await getUserInfoTool.execute({ wallet: peerWallet })) as Record<string, unknown>;
    assert(userInfo.wallet === peerWallet, "user_info_wallet_mismatch", userInfo);
    summary.userInfo = userInfo;

    const searchAgents = (await searchAgentsTool.execute({ limit: 5 })) as Record<string, unknown>;
    assert(Array.isArray(searchAgents.agents), "search_agents_missing_agents_array", searchAgents);
    summary.searchAgents = {
        total: searchAgents.total ?? null,
        returned: Array.isArray(searchAgents.agents) ? searchAgents.agents.length : null,
    };

    const sendDelivered = (await sendDmTool.execute({
        to_wallet: peerWallet,
        text: sendText,
    })) as Record<string, unknown>;
    assert(sendDelivered.status === "delivered", "send_delivered_not_delivered", sendDelivered);
    summary.sendDelivered = sendDelivered;

    const conversations = (await listConversationsTool.execute({ limit: listLimit })) as Record<string, unknown>;
    const conversation = Array.isArray(conversations.conversations)
        ? conversations.conversations.find(
              (entry) =>
                  entry && typeof entry === "object" && (entry as Record<string, unknown>).peerWallet === peerWallet,
          )
        : null;
    assert(conversation, "conversation_not_found_for_peer", conversations);
    summary.conversation = conversation;

    const convId = String((conversation as Record<string, unknown>).convId || "");
    const messages = (await readDmsTool.execute({
        conv_id: convId,
        limit: listLimit,
    })) as Record<string, unknown>;
    assert(Array.isArray(messages.messages), "read_dms_missing_messages_array", messages);
    summary.messages = messages;

    const latestSeq = Number(
        (conversation as Record<string, unknown>).seqMax ||
            (sendDelivered.seq as number | undefined) ||
            ((messages.messages as Array<Record<string, unknown>>)[0]?.seq as number | undefined),
    );
    assert(Number.isFinite(latestSeq) && latestSeq > 0, "latest_seq_missing", {
        conversation,
        sendDelivered,
        messages,
    });

    const markRead = (await markReadTool.execute({
        conv_id: convId,
        seq: latestSeq,
        read_at: new Date().toISOString(),
    })) as Record<string, unknown>;
    assert(markRead.marked === true, "mark_read_not_marked", markRead);
    summary.markRead = markRead;

    try {
        await sendDmTool.execute({
            to_wallet: peerWallet,
            text: "",
        });
        summary.invalidInput = {
            ok: false,
            message: "expected invalid input error but tool call succeeded",
        };
    } catch (error) {
        const message = asErrorMessage(error);
        summary.invalidInput = {
            ok: true,
            message,
        };
        assert(
            message.includes("INVALID_INPUT") || message.includes('"status":400') || message.includes('"status":422'),
            "invalid_input_error_not_detected",
            message,
        );
    }

    const pendingWallet = process.env.DESIDE_PENDING_TO_WALLET;
    if (pendingWallet) {
        summary.sendPending = await sendDmTool.execute({
            to_wallet: pendingWallet,
            text: process.env.DESIDE_PENDING_TEXT || `Hello pending @ ${new Date().toISOString()}`,
        });
    } else {
        (summary.skips as string[]).push("pending_acceptance skipped: DESIDE_PENDING_TO_WALLET not set");
    }

    const client = new DesideClient(smokeOptions);
    const clientIdentity = (await client.getMyIdentity(wallet, {} as never)) as Record<string, unknown>;
    assert(clientIdentity.wallet === wallet.getAddress(), "client_identity_wallet_mismatch", clientIdentity);

    const authMap = (client as unknown as { authStateByWallet: Map<string, Record<string, unknown>> })
        .authStateByWallet;
    const currentAuth = authMap.get(wallet.getAddress());
    assert(currentAuth, "missing_auth_state_after_client_identity");

    if (typeof currentAuth.refreshToken === "string" && currentAuth.refreshToken.length > 0) {
        const beforeAccessToken = String(currentAuth.accessToken);
        authMap.set(wallet.getAddress(), {
            ...currentAuth,
            expiresAt: Date.now() - 1000,
        });
        await client.getMyIdentity(wallet, {} as never);
        const refreshedAuth = authMap.get(wallet.getAddress());
        assert(refreshedAuth, "missing_auth_state_after_refresh");
        summary.refresh = {
            ok: true,
            rotatedAccessToken: String(refreshedAuth.accessToken) !== beforeAccessToken,
        };

        authMap.set(wallet.getAddress(), {
            ...refreshedAuth,
            accessToken: "invalid-token-for-smoke",
            expiresAt: Date.now() + 60_000,
        });
        await client.getMyIdentity(wallet, {} as never);
        const recoveredAuth = authMap.get(wallet.getAddress());
        assert(recoveredAuth, "missing_auth_state_after_auth_recovery");
        summary.authRecovery = {
            ok: true,
            recoveredFromInvalidToken: String(recoveredAuth.accessToken) !== "invalid-token-for-smoke",
        };
    } else {
        (summary.skips as string[]).push("refresh/auth recovery skipped: no refresh token available");
    }

    console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
