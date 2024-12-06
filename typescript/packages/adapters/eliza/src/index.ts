import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
    composeContext,
    generateObject,
    generateText,
} from "@ai16z/eliza";
import {
    type ChainForWalletClient,
    type DeferredTool,
    type Plugin,
    type WalletClient,
    addParametersToDescription,
    getDeferredTools,
    parametersToJsonExample,
} from "@goat-sdk/core";

type GetOnChainActionsParams<TWalletClient extends WalletClient> = {
    chain: ChainForWalletClient<TWalletClient>;
    getWalletClient: (runtime: IAgentRuntime) => Promise<TWalletClient>;
    plugins: Plugin<TWalletClient>[];
    supportsSmartWallets?: boolean;
};

export async function getOnChainActions<TWalletClient extends WalletClient>({
    getWalletClient,
    plugins,
    chain,
    supportsSmartWallets,
}: GetOnChainActionsParams<TWalletClient>): Promise<Action[]> {
    const tools = await getDeferredTools<TWalletClient>({
        plugins,
        wordForTool: "action",
        chain,
        supportsSmartWallets,
    });

    return tools.map((tool) => createAction(tool, getWalletClient));
}

function createAction<TWalletClient extends WalletClient>(
    tool: DeferredTool<TWalletClient>,
    getWalletClient: (runtime: IAgentRuntime) => Promise<TWalletClient>,
): Action {
    return {
        name: tool.name.toUpperCase(),
        similes: [],
        description: tool.description,
        validate: async () => true,
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State | undefined,
            options?: Record<string, unknown>,
            callback?: HandlerCallback,
        ): Promise<boolean> => {
            try {
                const walletClient = await getWalletClient(runtime);
                let currentState = state ?? (await runtime.composeState(message));
                currentState = await runtime.updateRecentMessageState(currentState);

                const parameterContext = composeParameterContext(tool, currentState);
                const parameters = await generateParameters(runtime, parameterContext);

                const parsedParameters = tool.parameters.safeParse(parameters);
                if (!parsedParameters.success) {
                    callback?.({
                        text: `Invalid parameters for action ${tool.name}: ${parsedParameters.error.message}`,
                        content: { error: parsedParameters.error.message },
                    });
                    return false;
                }

                const result = await tool.method(walletClient, parsedParameters.data);
                const responseContext = composeResponseContext(tool, result, currentState);
                const response = await generateResponse(runtime, responseContext);

                callback?.({ text: response, content: result });
                return true;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                callback?.({
                    text: `Error executing action ${tool.name}: ${errorMessage}`,
                    content: { error: errorMessage },
                });
                return false;
            }
        },
        examples: [],
    };
}

function composeParameterContext<TWalletClient extends WalletClient>(
    tool: DeferredTool<TWalletClient>,
    state: State,
): string {
    const contextTemplate = `Respond with a JSON markdown block containing only the extracted values for action "${
        tool.name
    }". Use null for any values that cannot be determined.

Example response:
\`\`\`json
${parametersToJsonExample(tool.parameters)}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information for the action "${tool.name}":
${addParametersToDescription("", tool.parameters)}
`;
    return composeContext({ state, template: contextTemplate });
}

async function generateParameters(runtime: IAgentRuntime, context: string): Promise<unknown> {
    return generateObject({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    });
}

function composeResponseContext<TWalletClient extends WalletClient>(
    tool: DeferredTool<TWalletClient>,
    result: unknown,
    state: State,
): string {
    const responseTemplate = `
The action "${tool.name}" was executed successfully.
Here is the result:
${JSON.stringify(result)}

Respond to the message knowing that the action was successful and these were the previous messages:
{{recentMessages}}
  `;
    return composeContext({ state, template: responseTemplate });
}

async function generateResponse(runtime: IAgentRuntime, context: string): Promise<string> {
    return generateText({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    });
}
