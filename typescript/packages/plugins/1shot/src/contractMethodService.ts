import { Tool, ToolBase, createTool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { ContractMethod, OneShotClient, SolidityStructParam, Transaction } from "@uxly/1shot-client";
import { ZodTypeAny, z } from "zod";
import {
    AddContractMethodToToolsParams,
    AssureToolsForSmartContractParams,
    ContractSearchParams,
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

    protected workingContractMethods = new Set<ContractMethod>();
    protected recentTransactions: Transaction[] = [];

    public async getTools(): Promise<ToolBase[]> {
        const tools = new Array<ToolBase>();

        // Add each contractMethod as a tool
        for (const contractMethod of this.workingContractMethods) {
            // Create the parameters for the contractMethod
            const endpointSchema = this.buildContractMethodParamSchema(contractMethod);

            // Write endpoints get an execute and estimate tool
            if (contractMethod.stateMutability === "payable" || contractMethod.stateMutability === "nonpayable") {
                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`execute_${contractMethod.name}`),
                            // TODO: Enhance the description to include basic information about the contractMethod such as whether it's a read or write contractMethod
                            description: `This will call the Contract Method ${contractMethod.name} with the given parameters which will perform a blockchain transaction. 
                        Contract Methods have a predefined Wallet, so the Wallet ID should only be provided if the user wants to change the default wallet.
                        1Shot API Contract Methods do not require any local wallet or signatures, the keys are managed by the 1Shot API service.
                        Do not provide any private keys or signatures in the parameters unless the parameters require a signature.
                        It will return the Transaction ID of the Transaction object representing the Contract Method execution. This can be used to retrieve the Transaction status and results.
                        Contract Method description: ${contractMethod.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the contractMethod
                            const response = await this.oneShotClient.contractMethods.execute(contractMethod.id, {
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
                            name: this.sanitizeToSafeString(`estimate_${contractMethod.name}`),
                            // TODO: Enhance the description to include basic information about the contractMethod such as whether it's a read or write contractMethod
                            description: `Retrieve an estimate of the gas required to execute the Contract Method. 
                            This will not spend any gas or execute any transactions.
                            Returns the amount of gas estimated to be spent in wei.
                            Contract Method description: ${contractMethod.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the contractMethod
                            const response = await this.oneShotClient.contractMethods.estimate(contractMethod.id, {
                                ...params,
                            });
                            console.log(response);
                            return response;
                        },
                    ),
                );

                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`test_${contractMethod.name}`),
                            // TODO: Enhance the description to include basic information about the contractMethod such as whether it's a read or write contractMethod
                            description: `Tests the Contrac tMethod without actually executing it. This is useful for debugging and testing. No funds will be spend but the Contract Method is simulated. Contract Method description: ${contractMethod.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Execute the contractMethod
                            const response = await this.oneShotClient.contractMethods.test(contractMethod.id, {
                                ...params,
                            });
                            console.log(response);
                            return response;
                        },
                    ),
                );
            }

            // Read endpoints get a read tool
            if (contractMethod.stateMutability === "view" || contractMethod.stateMutability === "pure") {
                tools.push(
                    createTool(
                        {
                            name: this.sanitizeToSafeString(`read_${contractMethod.name}`),
                            // TODO: Enhance the description to include basic information about the contractMethod such as whether it's a read or write contractMethod
                            description: `This will call the Contract Method ${contractMethod.name} with the given parameters and return the result of the smart contract call.
                        This works for Contract Methods with the stateMutability of view or pure.
                        This will not spend any gas or execute any transactions.
                        Returns the result of the smart contract call, which may be a struct or a single value.
                        Contract Method description: ${contractMethod.description}`,
                            parameters: endpointSchema,
                        },
                        async (params) => {
                            // Read from the contractMethod
                            const response = await this.oneShotClient.contractMethods.read(contractMethod.id, {
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
        description: `Performs a semantic search for smart contracts on the blockchain using the annotations on 1Shot API. 
            It will return up to 5 candidate 1Shot Prompts, which include all the major and/or important methods on the smart contract. 
            After identifying the contract you want to use, you can make sure tools are available for the described methods via the assure_contract_methods_from_prompt tool.`,
    })
    async searchSmartContracts(_walletClient: EVMWalletClient, parameters: ContractSearchParams) {
        const contracts = await this.oneShotClient.contractMethods.search(parameters.query, parameters);
        return contracts;
    }

    @Tool({
        name: "assure_contract_methods_from_prompt",
        description: `This assures that tools (in the form of Contract Methods) are available for the described methods on in the 1ShotPrompt. 
            If Contract Methods already exists for all the described methods, it will do nothing. 
            If it needs to it will create new Contract Methods based on either the highest-rated Prompt or on the chosen Prompt ID, using those annotations. 
            All described methods will be converted to tools with defined parameters. 
            It will return a list of Contract Method objects for the smart contract. 
            Make sure to use a valid Wallet ID for the chain you want via the list_wallets tool.`,
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
            this.workingContractMethods.add(contractMethod);
        }
        return Array.from(this.workingContractMethods);
    }

    @Tool({
        name: "add_contract_method_to_working_tools",
        description: `Adds a Contract Method to the list of working tools.
            The working tools are the tools that are available to the agent on the next instantiation.
            You can use list_contract_methods to get Contract Methods that are already configured in 1Shot API. 
            Returns the updated list of working tools.`,
    })
    async addContractMethodToTools(_walletClient: EVMWalletClient, parameters: AddContractMethodToToolsParams) {
        this.workingContractMethods.add(parameters);
        return Array.from(this.workingContractMethods);
    }

    @Tool({
        name: "list_contract_methods",
        description: "Returns a paginated list of Contract Methods for the configured business.",
    })
    async listContractMethods(_walletClient: EVMWalletClient, parameters: ListContractMethodsParams) {
        const contractMethods = await this.oneShotClient.contractMethods.list(this.businessId, parameters);
        return contractMethods;
    }

    @Tool({
        name: "list_wallets",
        description: `Returns a paginated list of Wallets for the configured business.
            Wallets are hot wallets controlled by 1Shot API.
            All Contract Methods are executed via a Wallet.
            Wallets are tied to a particular chain so you should always include a chain Id when getting a listing.`,
    })
    async listWallets(_walletClient: EVMWalletClient, parameters: ListWalletsParams) {
        const wallets = await this.oneShotClient.wallets.list(this.businessId, parameters);
        return wallets;
    }

    @Tool({
        name: "get_transaction",
        description: `Get the status and results of a single Transaction.
            It needs the Transaction ID, which is the id field on a Transaction object.`,
    })
    async getTransaction(_walletClient: EVMWalletClient, parameters: GetTransactionParams) {
        const transaction = await this.oneShotClient.transactions.get(parameters.transactionId);
        return transaction;
    }

    @Tool({
        name: "list_transactions",
        description: `Returns a paginated list of Transaction objects.
            It accepts a businessId and a list of filters.
            The filters are optional and can be used to filter the transactions by status, chainId, contractMethodId, walletId, or userId.
            The filters are ANDed together.`,
    })
    async listTransactions(_walletClient: EVMWalletClient, parameters: ListTransactionsParams) {
        const transactions = await this.oneShotClient.transactions.list(this.businessId, parameters);
        return transactions;
    }

    @Tool({
        name: "get_recent_transactions",
        description: `Returns a list of all the Transactions that you have interacted with during the current session.
            This data will be stale.
            You must get the most recent data about these Transactions via the get_transaction tool.
            Transactions take a while to be processed, so you may need to poll for the most recent data.`,
    })
    async getRecentTransactions(_walletClient: EVMWalletClient, parameters: GetRecentTransactionParams) {
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
