import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";
import {
    contractSearchSchema,
    contractContractMethodsSchema,
    createContractMethodSchema,
    getTransactionSchema,
    listWalletsSchema,
    listTransactionsSchema,
    listContractMethodsSchema,
    contractMethodSchema,
} from "@uxly/1shot-client";

export class ListContractMethodsParams extends createToolParameters(listContractMethodsSchema.omit({ businessId: true })) {}

export class ListWalletsParams extends createToolParameters(listWalletsSchema.omit({ businessId: true })) {}

export class CreateContractMethodParams extends createToolParameters(createContractMethodSchema.omit({ businessId: true })) {}

export class AddContractMethodToToolsParams extends createToolParameters(contractMethodSchema) {}

export class GetTransactionParams extends createToolParameters(getTransactionSchema) {}

export class ListTransactionsParams extends createToolParameters(
    listTransactionsSchema.omit({ businessId: true }),
) {}

export class GetRecentTransactionParams extends createToolParameters(z.object({})) {}

export class ContractSearchParams extends createToolParameters(contractSearchSchema) {}

export class AssureToolsForSmartContractParams extends createToolParameters(
    contractContractMethodsSchema.omit({ businessId: true }),
) {}
