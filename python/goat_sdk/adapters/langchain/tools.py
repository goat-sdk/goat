from typing import List, Optional, Union
from goat_sdk.core.plugins import Plugin
from goat_sdk.core import get_tools
from goat_sdk.core.wallets import WalletClient
from langchain_core.tools import Tool


async def getOnChainTools[TWalletClient: WalletClient](
    wallet: TWalletClient,
    plugins: Optional[List[Union[Plugin[TWalletClient], Plugin[WalletClient]]]] = [],
    wordForTool: Optional[str] = "",
):
    tools = await get_tools(wallet, plugins)
    return [
        Tool(
            name=t.name,
            description=t.description,
            func=t.method,
            args_schema=t.parameters,
        )
        for t in tools
    ]
