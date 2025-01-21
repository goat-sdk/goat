from typing import Dict, Literal, TypedDict

SolanaNetwork = Literal["devnet", "mainnet"]

class Token(TypedDict):
    decimals: int
    symbol: str
    name: str
    mintAddresses: Dict[SolanaNetwork, str | None]

USDC: Token = {
    "decimals": 6,
    "symbol": "USDC",
    "name": "USDC",
    "mintAddresses": {
        "devnet": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        "mainnet": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
}

GOAT: Token = {
    "decimals": 6,
    "symbol": "GOAT",
    "name": "GOAT",
    "mintAddresses": {
        "mainnet": "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump",
        "devnet": None,
    },
}

PENGU: Token = {
    "decimals": 6,
    "symbol": "PENGU",
    "name": "Pengu",
    "mintAddresses": {
        "mainnet": "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
        "devnet": None,
    },
}

SOL: Token = {
    "decimals": 9,
    "symbol": "SOL",
    "name": "Wrapped SOL",
    "mintAddresses": {
        "mainnet": "So11111111111111111111111111111111111111112",
        "devnet": "So11111111111111111111111111111111111111112",
    },
}

SPL_TOKENS: list[Token] = [USDC, GOAT, PENGU, SOL]
