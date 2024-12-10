"use client";

import { useConversation } from "@11labs/react";
import { getOnChainTools } from "@goat-sdk/adapter-eleven-labs";
import { useCallback, useEffect } from "react";

import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { DynamicWidget, getNetwork, useDynamicContext, useSwitchNetwork } from "@dynamic-labs/sdk-react-core";
import { coingecko } from "@goat-sdk/plugin-coingecko";
import { viem } from "@goat-sdk/wallet-viem";
import { sepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { sendETH } from "../../../../../../packages/core/dist/plugins/send-eth";

export function Conversation() {
    const { primaryWallet, sdkHasLoaded } = useDynamicContext();
    const switchNetwork = useSwitchNetwork();

    const checkAndSwitchNetwork = async () => {
        if (!primaryWallet) {
            throw new Error("Wallet not connected");
        }

        if (!isEthereumWallet(primaryWallet)) {
            throw new Error("Wallet is not Ethereum");
        }

        const network = await getNetwork(primaryWallet?.connector);

        if (network !== sepolia.id) {
            await switchNetwork({ wallet: primaryWallet, network: sepolia.id });
        }
    };

    useEffect(() => {
        if (primaryWallet) {
            checkAndSwitchNetwork();
        }
    }, [primaryWallet]);

    const { isConnected } = useAccount();
    const { data: wallet } = useWalletClient(); // Get the viem wallet client from Wagmi

    console.log("wallet", wallet);

    const conversation = useConversation({
        onConnect: () => console.log("Connected"),
        onDisconnect: () => console.log("Disconnected"),
        onMessage: (message) => console.log("Message:", message),
        onError: (error) => console.error("Error:", error),
    });

    const startConversation = useCallback(async () => {
        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            if (!wallet) {
                throw new Error("Wallet not connected");
            }

            // const wallet = viem Client
            const tools = await getOnChainTools({
                wallet: viem(wallet),
                plugins: [
                    sendETH(),
                    coingecko({
                        apiKey: process.env.NEXT_PUBLIC_COINGECKO_API_KEY ?? "",
                    }),
                ],
                options: {
                    logTools: true,
                },
            });

            // Start the conversation with your agent
            await conversation.startSession({
                agentId: process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID ?? "", // Replace with your agent ID
                clientTools: tools,
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
        }
    }, [conversation, wallet]);

    const stopConversation = useCallback(async () => {
        await conversation.endSession();
    }, [conversation]);

    if (!sdkHasLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold">{isConnected ? "1. You're Connected" : "1. Connect Wallet to start"}</h1>
            <DynamicWidget />

            <h1 className="text-2xl font-bold">2. Start Conversation with Agent</h1>
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={startConversation}
                        disabled={conversation.status === "connected" || !isConnected}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        type="button"
                    >
                        Start Conversation
                    </button>
                    <button
                        onClick={stopConversation}
                        disabled={conversation.status !== "connected"}
                        className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                        type="button"
                    >
                        Stop Conversation
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <p>Status: {conversation.status}</p>
                    {conversation.status === "connected" && (
                        <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
