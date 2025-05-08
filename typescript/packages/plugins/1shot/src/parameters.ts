import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";
import { listEscrowWalletsSchema, listTransactionsSchema, createTransactionSchema } from "@uxly/1shot-client";

export class ListTransactionsParams extends createToolParameters(listTransactionsSchema) {}

export class ListEscrowWalletsParams extends createToolParameters(
    listEscrowWalletsSchema
) {}

export class CreateTransactionParams extends createToolParameters(createTransactionSchema) {}


