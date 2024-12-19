export const kimRouterABI = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "tokenIn",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "tokenOut",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "recipient",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "deadline",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "amountIn",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "amountOutMinimum",
                        type: "uint256"
                    },
                    {
                        internalType: "uint160",
                        name: "limitSqrtPrice",
                        type: "uint160"
                    }
                ],
                internalType: "struct ISwapRouter.ExactInputSingleParams",
                name: "params",
                type: "tuple"
            }
        ],
        name: "exactInputSingle",
        outputs: [
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256"
            }
        ],
        stateMutability: "payable",
        type: "function"
    }
] as const;

export const kimNFTPositionManagerABI = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "token0",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "token1",
                        type: "address"
                    },
                    {
                        internalType: "int24",
                        name: "tickLower",
                        type: "int24"
                    },
                    {
                        internalType: "int24",
                        name: "tickUpper",
                        type: "int24"
                    },
                    {
                        internalType: "uint256",
                        name: "amount0Desired",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "amount1Desired",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "amount0Min",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "amount1Min",
                        type: "uint256"
                    },
                    {
                        internalType: "address",
                        name: "recipient",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "deadline",
                        type: "uint256"
                    }
                ],
                internalType: "struct INonfungiblePositionManager.MintParams",
                name: "params",
                type: "tuple"
            }
        ],
        name: "mint",
        outputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
            },
            {
                internalType: "uint128",
                name: "liquidity",
                type: "uint128"
            },
            {
                internalType: "uint256",
                name: "amount0",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amount1",
                type: "uint256"
            }
        ],
        stateMutability: "payable",
        type: "function"
    }
] as const; 