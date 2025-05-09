import { createToolParameters } from "@goat-sdk/core";
import { createTransactionSchema, listEscrowWalletsSchema, listTransactionsSchema } from "@uxly/1shot-client";

export class ListTransactionsParams extends createToolParameters(listTransactionsSchema.omit({ businessId: true })) {}

export class ListEscrowWalletsParams extends createToolParameters(listEscrowWalletsSchema.omit({ businessId: true })) {}

export class CreateTransactionParams extends createToolParameters(createTransactionSchema.omit({ businessId: true })) {}
