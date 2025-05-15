import { createToolParameters } from "@goat-sdk/core";
import {
    createTransactionSchema,
    getTransactionExecutionSchema,
    listEscrowWalletsSchema,
    listTransactionExecutionsSchema,
    listTransactionsSchema,
    transactionSchema,
} from "@uxly/1shot-client";

export class ListTransactionsParams extends createToolParameters(listTransactionsSchema.omit({ businessId: true })) {}

export class ListEscrowWalletsParams extends createToolParameters(listEscrowWalletsSchema.omit({ businessId: true })) {}

export class CreateTransactionParams extends createToolParameters(createTransactionSchema.omit({ businessId: true })) {}

export class AddTransactionToToolsParams extends createToolParameters(transactionSchema) {}

export class GetTransactionExecutionParams extends createToolParameters(getTransactionExecutionSchema) {}

export class ListTransactionExecutionsParams extends createToolParameters(listTransactionExecutionsSchema.omit({ businessId: true })) {}
