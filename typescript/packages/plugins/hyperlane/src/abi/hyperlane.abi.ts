export default [
    {
        type: "function",
        name: "getDeliveredMessages",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256", name: "" }],
    },
    {
        type: "function",
        name: "getGasUsed",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256", name: "" }],
    },
    {
        type: "function",
        name: "getAverageLatency",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256", name: "" }],
    },
    {
        type: "function",
        name: "getSuccessRate",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256", name: "" }],
    },
] as const;
