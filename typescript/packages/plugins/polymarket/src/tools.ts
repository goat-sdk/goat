import type { EVMWalletClient, Tool } from "@goat-sdk/core";
import type { z } from "zod";

import type { ApiKeyCredentials } from "./api";
import {
    cancelAllOrdersParametersSchema,
    cancelOrderParametersSchema,
    createOrderParametersSchema,
    getEventsParametersSchema,
    getMarketInfoParametersSchema,
    getOpenOrdersParametersSchema,
} from "./parameters";

import { cancelAllOrders, cancelOrder, createOrder, getEvents, getMarketInfo, getOpenOrders } from "./api";

export type PolymarketToolsOptions = {
    credentials: ApiKeyCredentials;
};

export function getTools(walletClient: EVMWalletClient, { credentials }: PolymarketToolsOptions): Tool[] {
    return [
        {
            name: "get_polymarket_events",
            description: "This {{tool}} gets the events on Polymarket including their markets",
            parameters: getEventsParametersSchema,
            method: async (parameters: z.infer<typeof getEventsParametersSchema>) => {
                return getEvents(parameters);
            },
        },
        {
            name: "get_polymarket_market_info",
            description: "This {{tool}} gets the info of a specific market on Polymarket",
            parameters: getMarketInfoParametersSchema,
            method: async (parameters: z.infer<typeof getMarketInfoParametersSchema>) => {
                return getMarketInfo(walletClient, parameters);
            },
        },
        {
            name: "create_order_on_polymarket",
            description: "This {{tool}} creates an order on Polymarket",
            parameters: createOrderParametersSchema,
            method: async (parameters: z.infer<typeof createOrderParametersSchema>) => {
                return createOrder(walletClient, credentials, parameters);
            },
        },
        {
            name: "get_active_polymarket_orders",
            description: "This {{tool}} gets the active orders on Polymarket",
            parameters: getOpenOrdersParametersSchema,
            method: async (parameters: z.infer<typeof getOpenOrdersParametersSchema>) => {
                return getOpenOrders(walletClient, credentials, parameters);
            },
        },
        {
            name: "cancel_polymarket_order",
            description: "This {{tool}} cancels an order on Polymarket",
            parameters: cancelOrderParametersSchema,
            method: async (parameters: z.infer<typeof cancelOrderParametersSchema>) => {
                return cancelOrder(walletClient, credentials, parameters);
            },
        },
        {
            name: "cancel_all_polymarket_orders",
            description: "This {{tool}} cancels all orders on Polymarket",
            parameters: cancelAllOrdersParametersSchema,
            method: async (_parameters: z.infer<typeof cancelAllOrdersParametersSchema>) => {
                return cancelAllOrders(walletClient, credentials);
            },
        },
    ];
}
