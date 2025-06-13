import { Tool, ToolBase, createTool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ContractMethod, OneShotClient, SolidityStructParam, Transaction } from "@uxly/1shot-client";
import { ZodTypeAny, z } from "zod";
import {
    AddContractMethodToToolsParams,
    AssureToolsForSmartContractParams,
    ContractSearchParams,
    CreateContractMethodParams,
    GetRecentTransactionParams,
    GetTransactionParams,
    ListContractMethodsParams,
    ListTransactionsParams,
    ListWalletsParams,
} from "./parameters.js";

export class ContractMethodService {
    public constructor(
        protected readonly oneShotClient: OneShotClient,
        protected readonly businessId: string,
    ) {}

    protected workingEndpoints = new Set<ContractMethod>();
    protected recentTransactions: Transaction[] = [];

    public async getTools(): Promise<ToolBase[]> {
        const tools = new Array<ToolBase>();

        // Add each endpoint as a tool
        for (const endpoint of this.workingEndpoints) {
            // Create the parameters for the endpoint
            const endpointSchema = this.buildContractMethodParamSchema(endpoint);

            // Every endpoint has a test tool
            tools.push(
                createTool(
                    {
                        name: this.sanitizeToSafeString(`test_${endpoint.name}`),
                        // TODO: Enhance the description to include basic information about the endpoint such as whether it's a read or write endpoint
                        description: `Tests the endpoint without actually executing it. This is useful for debugging and testing. No funds will be spend but the contractMethod is simulated. Endpoint description: ${endpoint.description}`,
                        parameters: endpointSchema,
                    },
                    async (params) => {
                        // Execute the endpoint
                        const response = await this.oneShotClient.contractMethods.test(endpoint.id, {
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
                            description: `This will call the endpoint ${endpoint.name} with the given parameters which will perform a blockchain contractMethod. 
                        Endpoints have a predefined escrow wallet, so the escrow wallet ID should only be provided if the user wants to change the default wallet.
                        1Shot contractMethods do not require any local wallet or signatures, the keys are managed by the 1Shot service.
                        Do not provide any private keys or signatures in the parameters unless the parameters require a signature.
                        It will return the TransactionID of the contractMethod, which can be used to retrieve the contractMethod status and results.
                        Endpoint description: ${endpoint.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the endpoint
                            const response = await this.oneShotClient.contractMethods.execute(endpoint.id, {
                                ...params,
                            });
                            console.log(response);
                            this.recentTransactions.push(response);
                            return response;
                        },
                    ),
                );

                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`estimate_${endpoint.name}`),
                            // TODO: Enhance the description to include basic information about the endpoint such as whether it's a read or write endpoint
                            description: `Retrieve an estimate of the gas required to execute the contractMethod. 
                            This will not spend any gas or execute any contractMethods.
                            Returns the amount of gas estimated to be spent in wei.
                            Endpoint description: ${endpoint.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the endpoint
                            const response = await this.oneShotClient.contractMethods.estimate(endpoint.id, {
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
                        This will not spend any gas or execute any contractMethods.
                        Returns the result of the smart contract call, which may be a struct or a single value.
                        Endpoint description: ${endpoint.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Read from the endpoint
                            const response = await this.oneShotClient.contractMethods.read(endpoint.id, {
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
        const contracts = await this.oneShotClient.contractMethods.search(parameters.query, parameters);
        return contracts;
    }

    @Tool({
        name: "assure_contract_methods_from_prompt",
        description:
            "This assures that tools (in the form of Contract Methods) are available for the described methods on in the Prompt. If Contract Methods already exists for all the described methods, it will do nothing. If it needs to it will create new Contract Methods based on either the highest-rated Prompt or on the chosen Prompt ID, using those annotations. All described methods will be converted to Contract Methods with defined parameters. It will return a list of Contract Method objects for the smart contract. Make sure to use a valid wallet ID for the chain you want via the list_wallets tool.",
    })
    async assureContractMethodsFromPrompt(
        _walletClient: EVMWalletClient,
        parameters: AssureToolsForSmartContractParams,
    ) {
        const contractMethods = await this.oneShotClient.contractMethods.assureContractMethodsFromPrompt(
            this.businessId,
            parameters,
        );
        for (const contractMethod of contractMethods) {
            this.workingEndpoints.add(contractMethod);
        }
        return Array.from(this.workingEndpoints);
    }

    @Tool({
        name: "add_contractMethod_to_working_endpoints",
        description:
            "Adds a contractMethod to the list of working endpoints. You can use list_contractMethods to get contractMethods that are already configured in 1Shot. If you use use create_contractMethod to create a new contractMethod it will automatically be added to the list of working endpoints. Returns the updated list of working endpoints.",
    })
    async addContractMethodToTools(_walletClient: EVMWalletClient, parameters: AddContractMethodToToolsParams) {
        this.workingEndpoints.add(parameters);
        return Array.from(this.workingEndpoints);
    }

    @Tool({
        name: "list_contractMethods",
        description: "Returns a paginated list of contractMethods for the configured business. ",
    })
    async listContractMethods(_walletClient: EVMWalletClient, parameters: ListContractMethodsParams) {
        const contractMethods = await this.oneShotClient.contractMethods.list(this.businessId, parameters);
        return contractMethods;
    }

    @Tool({
        name: "create_contractMethod",
        description:
            "Creates a new contractMethod for the configured business. Returns the created contractMethod. You should check whether or not there is already a contractMethod created via the list_contractMethods tool first, if there is, you should use the add_contractMethod_to_working_endpoints tool to add it to the list of working endpoints rather than creating a new contractMethod.",
    })
    async createContractMethod(_walletClient: EVMWalletClient, parameters: CreateContractMethodParams) {
        const contractMethods = await this.oneShotClient.contractMethods.create(this.businessId, parameters);
        return contractMethods;
    }

    @Tool({
        name: "list_wallets",
        description:
            "Returns a paginated list of Escrow Wallets for the configured business. Wallets are hot wallets controlled by 1Shot. All contractMethods are executed via an escrow wallet. Wallets are tied to a particular chain so you should always include a chain Id when getting a listing. ",
    })
    async listWallets(_walletClient: EVMWalletClient, parameters: ListWalletsParams) {
        const wallets = await this.oneShotClient.wallets.list(this.businessId, parameters);
        return wallets;
    }

    @Tool({
        name: "get_transaction",
        description:
            "Get the status and results of a single Transaction. It needs the Transaction ID, which is the id field on a Transaction object.",
    })
    async getTransaction(_walletClient: EVMWalletClient, parameters: GetTransactionParams) {
        const transaction = await this.oneShotClient.transactions.get(parameters.transactionId);
        return transaction;
    }

    @Tool({
        name: "list_transactions",
        description:
            "Returns a paginated list of Transaction objects. It accepts a businessId and a list of filters. The filters are optional and can be used to filter the transactions by status, chainId, contractMethodId, walletId, or userId. The filters are ANDed together.",
    })
    async listTransactions(_walletClient: EVMWalletClient, parameters: ListTransactionsParams) {
        const transactions = await this.oneShotClient.transactions.list(this.businessId, parameters);
        return transactions;
    }

    @Tool({
        name: "get_recent_transactions",
        description:
            "Returns a list of all the Transactions that you have interacted with during the current session. This data will be stale. You must get the most recent data about these Transactions via the get_transaction tool.",
    })
    async getRecentTransaction(_walletClient: EVMWalletClient, parameters: GetRecentTransactionParams) {
        return this.recentTransactions;
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

    // Create schema for a ContractMethod's `inputs` field

    protected buildContractMethodParamSchema(tx: ContractMethod): ZodTypeAny {
        return this.buildZodSchemaFromParams(tx.inputs);
    }

    protected sanitizeToSafeString(input: string): string {
        return input
            .replace(/\s+/g, "_") // replace all whitespace with underscores
            .replace(/[^a-zA-Z0-9_-]/g, ""); // remove all other non-matching characters
    }
}
