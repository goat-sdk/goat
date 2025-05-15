import { Tool, ToolBase, createTool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { OneShotClient, SolidityStructParam, Transaction, TransactionExecution } from "@uxly/1shot-client";
import { ZodTypeAny, z } from "zod";
import {
    AddTransactionToToolsParams,
    AssureToolsForSmartContractParams,
    ContractSearchParams,
    CreateTransactionParams,
    GetTransactionExecutionParams,
    ListEscrowWalletsParams,
    ListTransactionExecutionsParams,
    ListTransactionsParams,
} from "./parameters.js";

export class TransactionService {
    public constructor(
        protected readonly oneShotClient: OneShotClient,
        protected readonly businessId: string,
    ) {}

    protected workingEndpoints = new Set<Transaction>();
    protected recentTransactionExecutions: TransactionExecution[] = [];

    public async getTools(): Promise<ToolBase[]> {
        const tools = new Array<ToolBase>();

        // Add each endpoint as a tool
        for (const endpoint of this.workingEndpoints) {
            // Create the parameters for the endpoint
            const endpointSchema = this.buildTransactionParamSchema(endpoint);

            // Every endpoint has a test tool
            tools.push(
                createTool(
                    {
                        name: this.sanitizeToSafeString(`test_${endpoint.name}`),
                        // TODO: Enhance the description to include basic information about the endpoint such as whether it's a read or write endpoint
                        description: `Tests the endpoint without actually executing it. This is useful for debugging and testing. No funds will be spend but the transaction is simulated. Endpoint description: ${endpoint.description}`,
                        parameters: endpointSchema,
                    },
                    async (params) => {
                        // Execute the endpoint
                        const response = await this.oneShotClient.transactions.test(endpoint.id, {
                            ...params,
                        });
                        console.log(response);
                        return response;
                    },
                ),
            );

            // Write endpoints get an execute and estimate tool
            if (endpoint.stateMutability === "payable" || endpoint.stateMutability === "nonpayable") {
                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`execute_${endpoint.name}`),
                            // TODO: Enhance the description to include basic information about the endpoint such as whether it's a read or write endpoint
                            description: `This will call the endpoint ${endpoint.name} with the given parameters which will perform a blockchain transaction. 
                        Endpoints have a predefined escrow wallet, so the escrow wallet ID should only be provided if the user wants to change the default wallet.
                        1Shot transactions do not require any local wallet or signatures, the keys are managed by the 1Shot service.
                        Do not provide any private keys or signatures in the parameters unless the parameters require a signature.
                        It will return the ExecutionID of the transaction, which can be used to retrieve the transaction status and results.
                        Endpoint description: ${endpoint.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the endpoint
                            const response = await this.oneShotClient.transactions.execute(endpoint.id, {
                                ...params,
                            });
                            console.log(response);
                            this.recentTransactionExecutions.push(response);
                            return response;
                        },
                    ),
                );

                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`estimate_${endpoint.name}`),
                            // TODO: Enhance the description to include basic information about the endpoint such as whether it's a read or write endpoint
                            description: `Retrieve an estimate of the gas required to execute the transaction. 
                            This will not spend any gas or execute any transactions.
                            Returns the amount of gas estimated to be spent in wei.
                            Endpoint description: ${endpoint.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the endpoint
                            const response = await this.oneShotClient.transactions.estimate(endpoint.id, {
                                ...params,
                            });
                            console.log(response);
                            return response;
                        },
                    ),
                );
            }

            // Read endpoints get a read tool
            if (endpoint.stateMutability === "view" || endpoint.stateMutability === "pure") {
                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`read_${endpoint.name}`),
                            // TODO: Enhance the description to include basic information about the endpoint such as whether it's a read or write endpoint
                            description: `This will call the endpoint ${endpoint.name} with the given parameters and return the result of the smart contract call.
                        This works for endpoints with the stateMutability of view or pure.
                        This will not spend any gas or execute any transactions.
                        Returns the result of the smart contract call, which may be a struct or a single value.
                        Endpoint description: ${endpoint.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Read from the endpoint
                            const response = await this.oneShotClient.transactions.read(endpoint.id, {
                                ...params,
                            });
                            console.log(response);
                            return response;
                        },
                    ),
                );
            }
        }

        return tools;
    }

    @Tool({
        name: "search_smart_contracts",
        description:
            "Performs a semantic search for smart contracts on the blockchain using the annotations on 1ShotAPI. It will return up to 5 candidate contract descriptions, which include all the major and/or important methods on the smart contract. After identifying the contract you want to use, you can make sure tools are available for the described methods via the assure_tools_for_smart_contract tool.",
    })
    async searchSmartContracts(_walletClient: EVMWalletClient, parameters: ContractSearchParams) {
        const contracts = await this.oneShotClient.transactions.search(parameters.query, parameters);
        return contracts;
    }

    @Tool({
        name: "assure_tools_for_smart_contract",
        description:
            "This assures that tools are available for the described methods on the smart contract. If Transactions already exists for all the described methods, it will do nothing. If it needs to it will create new transacitons based on the highest-rated ContractDescription available, using those annotations. All described methods will be converted to tools with defined parameters. It will return a list of Transacation objects for the smart contract.",
    })
    async assureToolsForSmartContract(_walletClient: EVMWalletClient, parameters: AssureToolsForSmartContractParams) {
        const transactions = await this.oneShotClient.transactions.contractTransactions(this.businessId, parameters);
        for (const transaction of transactions) {
            this.workingEndpoints.add(transaction);
        }
        return Array.from(this.workingEndpoints);
    }

    @Tool({
        name: "add_transaction_to_working_endpoints",
        description:
            "Adds a transaction to the list of working endpoints. You can use list_transactions to get transactions that are already configured in 1Shot. If you use use create_transaction to create a new transaction it will automatically be added to the list of working endpoints. Returns the updated list of working endpoints.",
    })
    async addTransactionToTools(_walletClient: EVMWalletClient, parameters: AddTransactionToToolsParams) {
        this.workingEndpoints.add(parameters);
        return Array.from(this.workingEndpoints);
    }

    @Tool({
        name: "list_transactions",
        description: "Returns a paginated list of transactions for the configured business. ",
    })
    async listTransactions(_walletClient: EVMWalletClient, parameters: ListTransactionsParams) {
        const transactions = await this.oneShotClient.transactions.list(this.businessId, parameters);
        return transactions;
    }

    @Tool({
        name: "create_transaction",
        description:
            "Creates a new transaction for the configured business. Returns the created transaction. You should check whether or not there is already a transaction created via the list_transactions tool first, if there is, you should use the add_transaction_to_working_endpoints tool to add it to the list of working endpoints rather than creating a new transaction.",
    })
    async createTransaction(_walletClient: EVMWalletClient, parameters: CreateTransactionParams) {
        const transactions = await this.oneShotClient.transactions.create(this.businessId, parameters);
        return transactions;
    }

    @Tool({
        name: "list_escrow_wallets",
        description: "Returns a paginated list of Escrow Wallets for the configured business. ",
    })
    async listEscrowWallets(_walletClient: EVMWalletClient, parameters: ListEscrowWalletsParams) {
        const wallets = await this.oneShotClient.wallets.list(this.businessId, parameters);
        return wallets;
    }

    @Tool({
        name: "get_transaction_execution",
        description:
            "Get the status and results of a single transaction execution. It needs the Transaction Execution ID, which is the id field on a TransactionExecution object.",
    })
    async getTransactionExecution(_walletClient: EVMWalletClient, parameters: GetTransactionExecutionParams) {
        const execution = await this.oneShotClient.executions.get(parameters.executionId);
        return execution;
    }

    @Tool({
        name: "list_transaction_executions",
        description:
            "Returns a paginated list of Transaction Execution objects.. It needs the Transaction Execution ID, which is the id field on a TransactionExecution object.",
    })
    async listTransactionExecutions(_walletClient: EVMWalletClient, parameters: ListTransactionExecutionsParams) {
        const executions = await this.oneShotClient.executions.list(this.businessId, parameters);
        return executions;
    }

    @Tool({
        name: "get_recent_transaction_executions",
        description:
            "Returns a list of all the Transaction Executions that you have interacted with during the current session. This data will be stale. You must get the most recent data about these Transaction Executions via the get_transaction_execution tool.",
    })
    async getRecentTransactionExecutions(_walletClient: EVMWalletClient, parameters: ListTransactionExecutionsParams) {
        return this.recentTransactionExecutions;
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
