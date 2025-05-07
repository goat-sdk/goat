import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class ListTransactionsParams extends createToolParameters(
    z.object({
        pageSize: z.number().optional().describe("The size of the page to return"),
        page: z.number().optional().describe("The page number to return"),
        chainId: z.number().optional().describe("The chain ID to return transactions for"),
        name: z.string().optional().describe("The name of the transaction to return"),
        status: z.enum(["live", "archived", "both"]).optional().describe("The status of the transaction to return"),
        contractAddress: z.string().optional().describe("The contract address to return transactions for"),
    }),
) {
    pageSize?: number;
    page?: number;
    chainId?: number;
    name?: string;
    status?: "live" | "archived" | "both";
    contractAddress?: string;
}

export class ListEscrowWalletsParams extends createToolParameters(
    z.object({
        pageSize: z.number().optional().describe("The size of the page to return"),
        page: z.number().optional().describe("The page number to return"),
        chainId: z.number().optional().describe("The chain ID to return transactions for"),
        name: z.string().optional().describe("The name of the transaction to return"),
        status: z.enum(["live", "archived", "both"]).optional().describe("The status of the transaction to return"),
        contractAddress: z.string().optional().describe("The contract address to return transactions for"),
    }),
) {
    chainId?: number;
    pageSize?: number;
    page?: number;
    name?: string;
}
