CFA_FORWARDER_ABI = [
    {
        "inputs": [
            {
                "internalType": "contract ISuperfluid",
                "name": "host",
                "type": "address",
            },
        ],
        "stateMutability": "nonpayable",
        "type": "constructor",
    },
    {"inputs": [], "name": "CFA_FWD_INVALID_FLOW_RATE", "type": "error"},
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "token",
                "type": "address",
            },
            {"internalType": "address", "name": "sender", "type": "address"},
            {"internalType": "address", "name": "receiver", "type": "address"},
            {"internalType": "int96", "name": "flowrate", "type": "int96"},
            {"internalType": "bytes", "name": "userData", "type": "bytes"},
        ],
        "name": "createFlow",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "token",
                "type": "address",
            },
            {"internalType": "address", "name": "sender", "type": "address"},
            {"internalType": "address", "name": "receiver", "type": "address"},
            {"internalType": "bytes", "name": "userData", "type": "bytes"},
        ],
        "name": "deleteFlow",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "token",
                "type": "address",
            },
            {"internalType": "address", "name": "sender", "type": "address"},
            {"internalType": "address", "name": "receiver", "type": "address"},
        ],
        "name": "getFlowrate",
        "outputs": [{"internalType": "int96", "name": "flowrate", "type": "int96"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "token",
                "type": "address",
            },
            {"internalType": "address", "name": "receiver", "type": "address"},
            {"internalType": "int96", "name": "flowrate", "type": "int96"},
        ],
        "name": "setFlowrate",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]

POOL_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "memberAddr",
                "type": "address",
            },
            {
                "internalType": "uint128",
                "name": "newUnits",
                "type": "uint128",
            },
        ],
        "name": "updateMemberUnits",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool",
            },
        ],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "memberAddr",
                "type": "address",
            },
        ],
        "name": "getUnits",
        "outputs": [
            {
                "internalType": "uint128",
                "name": "",
                "type": "uint128",
            },
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "memberAddr",
                "type": "address",
            },
        ],
        "name": "getMemberFlowRate",
        "outputs": [
            {
                "internalType": "int96",
                "name": "",
                "type": "int96",
            },
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getTotalFlowRate",
        "outputs": [
            {
                "internalType": "int96",
                "name": "",
                "type": "int96",
            },
        ],
        "stateMutability": "view",
        "type": "function",
    },
]
