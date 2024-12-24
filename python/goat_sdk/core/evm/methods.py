from typing import Dict, Optional

from goat_sdk.core.wallets import EVMWalletClient


def get_address(walletClient: EVMWalletClient, params: Dict) -> str:
    return walletClient.get_address()


async def get_balance(
    walletClient: EVMWalletClient, params: Optional[Dict] = {}
) -> str:
    try:
        addr = params["address"] if "address" in params else get_address(walletClient)
        resAddr = await walletClient.resolve_address(addr)
        raw_balance = await walletClient.balance_of(resAddr)
        return str(raw_balance.value // raw_balance.decimals)
    except Exception as e:
        raise ("Failed to fetch balance", e)
