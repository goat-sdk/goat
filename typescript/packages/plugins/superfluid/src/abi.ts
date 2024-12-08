import { parseAbi } from "viem";

export const CFA_FORWARDER_ABI = [
    {
        inputs: [
            {
                internalType: "contract ISuperfluid",
                name: "host",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    { inputs: [], name: "CFA_FWD_INVALID_FLOW_RATE", type: "error" },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
            { internalType: "int96", name: "flowrate", type: "int96" },
            { internalType: "bytes", name: "userData", type: "bytes" },
        ],
        name: "createFlow",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
            { internalType: "bytes", name: "userData", type: "bytes" },
        ],
        name: "deleteFlow",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "getAccountFlowInfo",
        outputs: [
            { internalType: "uint256", name: "lastUpdated", type: "uint256" },
            { internalType: "int96", name: "flowrate", type: "int96" },
            { internalType: "uint256", name: "deposit", type: "uint256" },
            { internalType: "uint256", name: "owedDeposit", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "getAccountFlowrate",
        outputs: [{ internalType: "int96", name: "flowrate", type: "int96" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "int96", name: "flowrate", type: "int96" },
        ],
        name: "getBufferAmountByFlowrate",
        outputs: [
            { internalType: "uint256", name: "bufferAmount", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
        ],
        name: "getFlowInfo",
        outputs: [
            { internalType: "uint256", name: "lastUpdated", type: "uint256" },
            { internalType: "int96", name: "flowrate", type: "int96" },
            { internalType: "uint256", name: "deposit", type: "uint256" },
            { internalType: "uint256", name: "owedDeposit", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "flowOperator", type: "address" },
        ],
        name: "getFlowOperatorPermissions",
        outputs: [
            { internalType: "uint8", name: "permissions", type: "uint8" },
            { internalType: "int96", name: "flowrateAllowance", type: "int96" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
        ],
        name: "getFlowrate",
        outputs: [{ internalType: "int96", name: "flowrate", type: "int96" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "flowOperator", type: "address" },
        ],
        name: "grantPermissions",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "flowOperator", type: "address" },
        ],
        name: "revokePermissions",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "receiver", type: "address" },
            { internalType: "int96", name: "flowrate", type: "int96" },
        ],
        name: "setFlowrate",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
            { internalType: "int96", name: "flowrate", type: "int96" },
        ],
        name: "setFlowrateFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
            { internalType: "int96", name: "flowrate", type: "int96" },
            { internalType: "bytes", name: "userData", type: "bytes" },
        ],
        name: "updateFlow",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "token",
                type: "address",
            },
            { internalType: "address", name: "flowOperator", type: "address" },
            { internalType: "uint8", name: "permissions", type: "uint8" },
            { internalType: "int96", name: "flowrateAllowance", type: "int96" },
        ],
        name: "updateFlowOperatorPermissions",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
];
