"use client";
import type { CoreMessage, ToolInvocation } from "ai";
import { useChat } from "ai/react";
import { type FC, Fragment } from "react";
import { useConfig } from "wagmi";

// utils
import getTools from "./getTools";

const Chat: FC = () => {
    const config = useConfig();
    const { handleInputChange, handleSubmit, input, messages } = useChat({
        maxSteps: 10,
        // this callback is used to invoke client-side tools, and we will need to get the tools
        // see https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot-tool-usage
        onToolCall: async ({ toolCall }) => {
            const tools = await getTools({
                client: true, // ensure the client is specified as this invokes the tools' execute logic
                wagmiConfig: config,
            });
            const tool = tools[toolCall.toolName];

            if (!tool?.execute) {
                return;
            }

            return await tool.execute(toolCall.args, {
                // toolCallId: toolCall.toolCallId,
                messages: messages as CoreMessage[],
            });
        },
    });

    return (
        <div>
            <div>
                {messages?.map((message) => {
                    const toolInvocation: ToolInvocation | null =
                        message.toolInvocations && message.toolInvocations.length > 0
                            ? message.toolInvocations[message.toolInvocations.length - 1]
                            : null;
                    const nodes = [];

                    if (message.content) {
                        nodes.push(<p>{message.content}</p>);
                    }

                    // if the tool returned a result
                    if (toolInvocation && toolInvocation.state === "result") {
                        nodes.push(<p>{JSON.stringify(toolInvocation.result)}</p>);
                    }

                    return (
                        <Fragment key={message.id}>
                            {nodes}
                        </Fragment>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit}>
                <input onChange={handleInputChange} type="text" value={input} />

                <button type="submit">Ask</button>
            </form>
        </div>
    );
};

export default Chat;
