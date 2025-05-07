import { PluginBase, ToolBase, WalletClientBase, createTool } from "@goat-sdk/core";
import { OneShotClient, SolidityStructParam, Transaction } from "@uxly/1shot-client";
import { ZodTypeAny, z } from "zod";
import { TransactionService } from "./transactionService.js";

export class OneShotPlugin extends PluginBase {
    constructor(
        protected readonly client: OneShotClient,
        protected readonly businessId: string,
    ) {
        super("1shot", [new TransactionService(client, businessId)]);
    }

    supportsChain = () => true;

    /**
     * Get a list of tools from the client
     * This is overridden because 1Shot tools are dynamic. It does mean that we can't easily use the
     * @Tool decorator on the methods in the TransactionService class.
     * @returns A list of tools
     */
    public async getTools(walletClient: WalletClientBase): Promise<ToolBase[]> {
        // Start with the tools from the base class, using the @Tool decorator
        const tools = await super.getTools(walletClient);

        // Get a list of endpoints from the client
        const endpoints = await this.client.transactions.list(this.businessId, {
            page: 1,
            pageSize: 100, // TODO: paginate
        });

        // Add each endpoint as a tool
        for (const endpoint of endpoints.response) {
            // Create the parameters for the endpoint
            const endpointSchema = this.buildTransactionParamSchema(endpoint);

            tools.push(
                createTool(
                    {
                        name: this.sanitizeToSafeString(endpoint.name),
                        description: endpoint.description,
                        parameters: endpointSchema,
                    },
                    async (params) => {
                        // Execute the endpoint
                        const response = await this.client.transactions.execute(this.businessId, {
                            ...params,
                        });

                        console.log(response);
                    },
                ),
            );
        }

        return tools;
    }

    // Map Solidity types to Zod schemas
    protected solidityTypeToZod(param: SolidityStructParam): ZodTypeAny {
        const baseType = (() => {
            switch (param.type) {
                case "address":
                    // Basic Ethereum address check
                    return z
                        .string()
                        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
                        .describe(param.description ?? "Ethereum Address");
                case "bool":
                    return z.boolean().describe(param.description ?? "Boolean");
                case "bytes":
                    return z
                        .string()
                        .regex(/^0x([a-fA-F0-9]{2})+$/, "Invalid bytes string")
                        .describe(param.description ?? "Bytes");
                case "int":
                case "uint":
                    return z
                        .string()
                        .regex(/^\d+$/, "Expected numeric string (uint/int)")
                        .describe(param.description ?? "Int");
                case "string":
                    return z.string().describe(param.description ?? "string");
                case "struct":
                    if (!param.typeStruct) {
                        throw new Error(`Missing typeStruct for struct param: ${param.name}`);
                    }
                    return this.buildZodSchemaFromParams(param.typeStruct.params);
                default:
                    throw new Error(`Unsupported Solidity type: ${param.type}`);
            }
        })();

        // Handle arrays
        if (param.isArray) {
            if (param.arraySize != null) {
                return z.array(baseType).length(param.arraySize);
            }
            return z.array(baseType);
        }
        return baseType;
    }

    // Build Zod schema from an array of SolidityStructParam
    protected buildZodSchemaFromParams(params: SolidityStructParam[]): ZodTypeAny {
        const shape: Record<string, ZodTypeAny> = {};

        for (const param of params) {
            // We assume all parameter names are unique in the same struct/function
            shape[param.name] = this.solidityTypeToZod(param);
        }

        return z.object(shape);
    }

    // Create schema for a Transaction's `inputs` field

    protected buildTransactionParamSchema(tx: Transaction): ZodTypeAny {
        return this.buildZodSchemaFromParams(tx.inputs);
    }

    protected sanitizeToSafeString(input: string): string {
        return input
            .replace(/\s+/g, "_") // replace all whitespace with underscores
            .replace(/[^a-zA-Z0-9_-]/g, ""); // remove all other non-matching characters
    }
}

export function oneshot(apiKey: string, apiSecret: string, businessId: string) {
    const client = new OneShotClient({ apiKey, apiSecret });
    return new OneShotPlugin(client, businessId);
}
