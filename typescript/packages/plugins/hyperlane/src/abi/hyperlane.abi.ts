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
] as const;
