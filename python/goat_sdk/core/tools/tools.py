from dataclasses import dataclass
from typing import Callable
from pydantic import BaseModel
from goat_sdk.core.wallets.core import WalletClient


@dataclass
class Tool:
    name: str
    description: str
    parameters: BaseModel
    method: Callable[[BaseModel], str]


@dataclass
class DeferredTool[TWalletClient: WalletClient]:
    name: str
    description: str
    parameters: BaseModel
    method: Callable[[TWalletClient, BaseModel], str]
