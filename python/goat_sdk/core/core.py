import logging
import re
from typing import List, Optional, Union

from goat_sdk.core.plugins import Plugin
from goat_sdk.core.tools import DeferredTool
from goat_sdk.core.wallets import WalletClient, Chain, is_evm_chain, is_solana_chain
from goat_sdk.core.evm import deferredEVMCoreTools


async def filter_plugin_tools[TWalletClient: WalletClient](
    plugin: Plugin[TWalletClient],
    chain: Chain,
    supportsSmartWallets: Optional[bool] = False,
) -> List[DeferredTool[TWalletClient]]:
    if not plugin.supports_chain(chain):
        logging.warning(
            "Plugin %s does not support chain %s. Skipping.", plugin.name, chain.type
        )
        return []
    if supportsSmartWallets and not plugin.supports_smart_wallets():
        logging.warning(
            "Plugin %s does not support smart wallets. Skipping.", plugin.name
        )
        return []
    tools = await plugin.get_tools(chain)

    if len(tools) == 0:
        logging.warning("Plugin %s returned no tools. Skipping.", plugin.name)

    return tools


def replace_tool_placeholder(template: str, wordForTool: Optional[str] = "tool"):
    """
    Replace the placeholder '{{ tool }}' in the template with the provided word.

    :param template: The input template string with the placeholder.
    :param word_for_tool: The word to replace the placeholder with. Defaults to "tool".
    :return: The template with the placeholder replaced by the word_for_tool.
    """
    # Use a regular expression to find and replace the placeholder '{{ tool }}'
    placeholder_regex = r"\{\{\s*tool\s*\}\}"
    return re.sub(placeholder_regex, wordForTool, template)


async def get_deferred_tools[TWalletClient: WalletClient](
    chain: Chain,
    plugins: Optional[List[Union[Plugin[TWalletClient], Plugin[WalletClient]]]] = [],
    supportsSmartWallets: Optional[bool] = False,
    wordForTool: Optional[str] = "",
) -> List[DeferredTool[TWalletClient]]:
    tools: List[DeferredTool[TWalletClient]] = []
    if is_evm_chain(chain):
        tools += deferredEVMCoreTools
    elif is_solana_chain(chain):
        pass
    else:
        raise ValueError("Unsupported chain type: %s" % chain.type)

    for plugin in plugins:
        tools += await filter_plugin_tools(plugin, chain, supportsSmartWallets)

    for tool in tools:
        tool.description = replace_tool_placeholder(tool.description, wordForTool)

    return tools


async def get_tools[TWalletClient: WalletClient](
    wallet: TWalletClient,
    plugins: Optional[List[Union[Plugin[TWalletClient], Plugin[WalletClient]]]] = [],
    wordForTool: Optional[str] = "",
) -> List[DeferredTool[TWalletClient]]:
    chain = wallet.get_chain()
    tools = await get_deferred_tools(
        chain,
        plugins,
        # TODO: isEVMSmartWalletClient(wallet)
        supportsSmartWallets=False,
        wordForTool=wordForTool,
    )
    for tool in tools:
        tool.method = lambda parameters: tool.method(wallet, parameters)
    return tools
