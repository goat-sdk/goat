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
    {
        type: 'function',
        name: 'announce',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'validator', type: 'address' },
          { name: 'signingAddress', type: 'address' },
        ],
        outputs: [],
    },
    {
        type: "function",
        name: "getAnnouncedStorageLocations",
        stateMutability: "view",
        inputs: [
          {
            name: "_validators",
            type: "address[]",
          },
        ],
        outputs: [
          {
            type: "string[][]",
          },
        ],
    },
] as const;
