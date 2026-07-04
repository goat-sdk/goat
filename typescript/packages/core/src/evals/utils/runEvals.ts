import type { PluginBase } from "../../classes/PluginBase";
import type { WalletClientBase } from "../../classes/WalletClientBase";
import { getTools } from "../../utils/getTools";

/**
 * Dataset format for evaluation
 */
export type EvalDataset = {
    inputs: { query: string };
    referenceOutputs: { tool: string; response: string };
}[];

/**
 * Configuration for the evaluation engine
 */
export type RunEvalConfig<TWalletClient extends WalletClientBase> = {
    wallet: TWalletClient;
    plugins: PluginBase<TWalletClient>[];
    llm: {
        invoke: (params: {
            messages: Array<{ role: string; content: string }>;
            tools: Array<{
                type: string;
                function: {
                    name: string;
                    description: string;
                    parameters: unknown;
                };
            }>;
        }) => Promise<{
            tool_calls?: Array<{
                name: string;
                args: string | Record<string, unknown>;
            }>;
        }>;
    };
};

/**
 * Deep comparison of objects
 */
function deepCompare(referenceArgs: unknown, actualArgs: unknown): boolean {
    if (
        typeof referenceArgs !== "object" ||
        typeof actualArgs !== "object" ||
        referenceArgs === null ||
        actualArgs === null
    ) {
        return referenceArgs === actualArgs;
    }

    const refObj = referenceArgs as Record<string, unknown>;
    const actObj = actualArgs as Record<string, unknown>;

    const referenceKeys = Object.keys(refObj);
    const actualKeys = Object.keys(actObj);

    // Ensure all reference keys are present in actual arguments
    if (!referenceKeys.every((key) => actualKeys.includes(key))) {
        return false;
    }

    // Only compare keys from reference (all mandatory) since the LLM may return optional parameters
    return referenceKeys.every((key) => deepCompare(refObj[key], actObj[key]));
}

/**
 * Compare tool parameters
 */
function compareParameters(
    referenceOutput: { tool: string; response: string },
    actualOutput: { tool: string; response: string | undefined },
): boolean {
    if (!actualOutput.response || !referenceOutput.response) return false;

    // Responses can be json strings (parameter object) or simple strings
    let parsedReferenceResponse: unknown = referenceOutput.response;
    let parsedActualResponse: unknown = actualOutput.response;

    try {
        parsedReferenceResponse = referenceOutput.response.startsWith("{")
            ? JSON.parse(referenceOutput.response)
            : referenceOutput.response;
    } catch (error) {
        parsedReferenceResponse = referenceOutput.response;
    }

    try {
        parsedActualResponse = actualOutput.response.startsWith("{")
            ? JSON.parse(actualOutput.response)
            : actualOutput.response;
    } catch (error) {
        parsedActualResponse = actualOutput.response;
    }

    return deepCompare(parsedReferenceResponse, parsedActualResponse);
}

/**
 * Compare tool names
 */
function compareToolNames(
    referenceOutput: { tool: string; response: string },
    actualOutput: { tool: string; response: string | undefined },
): boolean {
    return actualOutput.tool === referenceOutput.tool;
}

/**
 * Main evaluation function
 */
export async function runEvals<TWalletClient extends WalletClientBase>(
    dataset: EvalDataset,
    config: RunEvalConfig<TWalletClient>,
    testName: string,
): Promise<{
    success: boolean;
    results: {
        query: string;
        passed: boolean;
        details: Record<string, unknown>;
    }[];
}> {
    const tools = await getTools({
        wallet: config.wallet,
        plugins: config.plugins,
    });

    // Results to be returned
    const results: {
        query: string;
        passed: boolean;
        details: Record<string, unknown>;
    }[] = [];
    let allPassed = true;

    for (const testCase of dataset) {
        try {
            // Process query with LLM using the tools
            const result = await config.llm.invoke({
                messages: [{ role: "user", content: testCase.inputs.query }],
                tools: tools.map((tool) => ({
                    type: "function",
                    function: {
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters,
                    },
                })),
            });

            // Extract tool call from LLM response
            const toolCall = result.tool_calls?.[0];

            if (!toolCall) {
                console.warn(`No tool call found for query: ${testCase.inputs.query}`);
                results.push({
                    query: testCase.inputs.query,
                    passed: false,
                    details: { error: "No tool call found" },
                });
                allPassed = false;
                continue;
            }

            // Compare the tool call against the reference
            const actualOutput = {
                tool: toolCall.name,
                response: typeof toolCall.args === "string" ? toolCall.args : JSON.stringify(toolCall.args),
            };

            const toolNameCorrect = compareToolNames(testCase.referenceOutputs, actualOutput);
            const parametersCorrect = compareParameters(testCase.referenceOutputs, actualOutput);
            const passed = toolNameCorrect && parametersCorrect;

            results.push({
                query: testCase.inputs.query,
                passed,
                details: {
                    expected: testCase.referenceOutputs,
                    actual: actualOutput,
                    toolNameCorrect,
                    parametersCorrect,
                },
            });

            console.log(`${passed ? "🟢" : "🔴"} Test "${testCase.inputs.query}": ${passed ? "PASSED" : "FAILED"}`);

            // Add detailed logging for failures
            if (!passed) {
                if (!toolNameCorrect) {
                    console.log(
                        `  Tool name mismatch: expected "${testCase.referenceOutputs.tool}", got "${actualOutput.tool}"`,
                    );
                }
                if (!parametersCorrect) {
                    console.log("  Parameters mismatch:");
                    console.log(`    Expected: ${testCase.referenceOutputs.response}`);
                    console.log(`    Received: ${actualOutput.response}`);
                }
            }

            if (!passed) {
                allPassed = false;
            }
        } catch (error: unknown) {
            console.error(`Error evaluating query: ${testCase.inputs.query}`, error);
            results.push({
                query: testCase.inputs.query,
                passed: false,
                details: {
                    error: error instanceof Error ? error.message : String(error),
                },
            });
            allPassed = false;
        }
    }

    console.log(`\n${testName} results: ${allPassed ? "🟢 ALL PASSED" : "🔴 SOME FAILED"}`);

    return {
        success: allPassed,
        results,
    };
}
