export default [
    {
        type: "function",
        name: "addValidator",
        stateMutability: "nonpayable",
        inputs: [
            { name: "validator", type: "address" },
            { name: "weight", type: "uint256" },
        ],
        outputs: [],
    },
    {
        type: "function",
        name: "removeValidator",
        stateMutability: "nonpayable",
        inputs: [{ name: "validator", type: "address" }],
        outputs: [],
    },
    {
        type: "function",
        name: "updateValidatorWeight",
        stateMutability: "nonpayable",
        inputs: [
            { name: "validator", type: "address" },
            { name: "weight", type: "uint256" },
        ],
        outputs: [],
    },
    {
        constant: true,
        type: "function",
        name: "decimals",
        stateMutability: "view",
        payable: false,
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },
    {
        constant: false,
        type: "function",
        name: "approve",
        payable: false,
        stateMutability: "nonpayable",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        type: "function",
        name: "quoteDispatch",
        stateMutability: "view",
        inputs: [
            { name: "_destinationDomain", type: "uint32" },
            { name: "_recipientAddress", type: "bytes32" },
            { name: "_messageBody", type: "bytes" },
        ],
        outputs: [{ name: "fee", type: "uint256" }],
    },
] as const;

export const transferRemoteNativeAbi = [
    {
        type: "function",
        name: "transferRemote",
        stateMutability: "payable",
        inputs: [
            { name: "destination", type: "uint32" },
            { name: "recipient", type: "bytes32" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
] as const;

export const transferRemoteCollateralAbi = [
    {
        type: "function",
        name: "transferRemote",
        stateMutability: "nonpayable",
        inputs: [
            { name: "destination", type: "uint32" },
            { name: "recipient", type: "bytes32" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
] as const;
