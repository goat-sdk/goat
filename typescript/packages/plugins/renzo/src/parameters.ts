import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class DepositParams extends createToolParameters(
    z.object({
        _token: z.string().describe("The token to deposit"),
        _amountIn: z.string().describe("The amount of tokens to deposit"),
        _minOut: z.string().describe("The minimum amount of tokens to receive"),
        _deadline: z.string().describe("The deadline for the deposit"),
    })
) {}

export class DepositETHParams extends createToolParameters(
    z.object({
        _minOut: z.string().describe("The minimum amount of ETH to receive"),
        _deadline: z.string().describe("The deadline for the deposit"),
        _value: z.string().describe("The amount of ETH to send"),
    })
) {}

export class BalanceOfParams extends createToolParameters(
    z.object({
        _address: z.string().describe("The address to check the balance of"),
    })
) {}

export class ApproveDepositParams extends createToolParameters(
    z.object({
        _token: z.string().describe("The token to approve"),
        _amount: z.string().describe("The amount of tokens to approve"),
    })
) {}

export class GetDepositAddressParams extends createToolParameters(
    z.object({}) // Empty schema for getRenzoDepositAddress
) {}
