export const routerABI = [
    {
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "path", type: "address[]" },
        ],
        name: "getAmountsOut",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForTokens",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "amountOut", type: "uint256" },
            { name: "amountInMax", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
        ],
        name: "swapTokensForExactTokens",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
        ],
        name: "swapExactTokensForETH",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "amountOut", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" },
        ],
        name: "swapExactETHForTokens",
        outputs: [{ name: "amounts", type: "uint256[]" }],
        stateMutability: "payable",
        type: "function",
    },
] as const; 