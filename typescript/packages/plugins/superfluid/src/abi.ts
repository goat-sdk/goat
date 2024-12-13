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

export const POOL_ABI = [
    {
        inputs: [],
        name: "SUPERFLUID_POOL_INVALID_TIME",
        type: "error",
    },
    {
        inputs: [],
        name: "SUPERFLUID_POOL_NOT_GDA",
        type: "error",
    },
    {
        inputs: [],
        name: "SUPERFLUID_POOL_NOT_POOL_ADMIN_OR_GDA",
        type: "error",
    },
    {
        inputs: [],
        name: "SUPERFLUID_POOL_NO_POOL_MEMBERS",
        type: "error",
    },
    {
        inputs: [],
        name: "SUPERFLUID_POOL_NO_ZERO_ADDRESS",
        type: "error",
    },
    {
        inputs: [],
        name: "SUPERFLUID_POOL_SELF_TRANSFER_NOT_ALLOWED",
        type: "error",
    },
    {
        inputs: [],
        name: "SUPERFLUID_POOL_TRANSFER_UNITS_NOT_ALLOWED",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract ISuperfluidToken",
                name: "token",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "member",
                type: "address",
            },
            {
                indexed: false,
                internalType: "int256",
                name: "claimedAmount",
                type: "int256",
            },
            {
                indexed: false,
                internalType: "int256",
                name: "totalClaimed",
                type: "int256",
            },
        ],
        name: "DistributionClaimed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract ISuperfluidToken",
                name: "token",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "member",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "oldUnits",
                type: "uint128",
            },
            {
                indexed: false,
                internalType: "uint128",
                name: "newUnits",
                type: "uint128",
            },
        ],
        name: "MemberUnitsUpdated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        inputs: [],
        name: "admin",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
        ],
        name: "claimAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "claimAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "subtractedValue",
                type: "uint256",
            },
        ],
        name: "decreaseAllowance",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "distributionFromAnyAddress",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
            {
                internalType: "uint32",
                name: "time",
                type: "uint32",
            },
        ],
        name: "getClaimable",
        outputs: [
            {
                internalType: "int256",
                name: "",
                type: "int256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
        ],
        name: "getClaimableNow",
        outputs: [
            {
                internalType: "int256",
                name: "claimableBalance",
                type: "int256",
            },
            {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint32",
                name: "time",
                type: "uint32",
            },
        ],
        name: "getDisconnectedBalance",
        outputs: [
            {
                internalType: "int256",
                name: "balance",
                type: "int256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
        ],
        name: "getMemberFlowRate",
        outputs: [
            {
                internalType: "int96",
                name: "",
                type: "int96",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
        ],
        name: "getTotalAmountReceivedByMember",
        outputs: [
            {
                internalType: "uint256",
                name: "totalAmountReceived",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getTotalConnectedFlowRate",
        outputs: [
            {
                internalType: "int96",
                name: "",
                type: "int96",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getTotalConnectedUnits",
        outputs: [
            {
                internalType: "uint128",
                name: "",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getTotalDisconnectedFlowRate",
        outputs: [
            {
                internalType: "int96",
                name: "",
                type: "int96",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getTotalDisconnectedUnits",
        outputs: [
            {
                internalType: "uint128",
                name: "",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getTotalFlowRate",
        outputs: [
            {
                internalType: "int96",
                name: "",
                type: "int96",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getTotalUnits",
        outputs: [
            {
                internalType: "uint128",
                name: "",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
        ],
        name: "getUnits",
        outputs: [
            {
                internalType: "uint128",
                name: "",
                type: "uint128",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "addedValue",
                type: "uint256",
            },
        ],
        name: "increaseAllowance",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "superToken",
        outputs: [
            {
                internalType: "contract ISuperfluidToken",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "transferabilityForUnitsOwner",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "memberAddr",
                type: "address",
            },
            {
                internalType: "uint128",
                name: "newUnits",
                type: "uint128",
            },
        ],
        name: "updateMemberUnits",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
