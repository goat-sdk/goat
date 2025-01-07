from dataclasses import dataclass
from typing import Any, Callable, NotRequired, Type, TypedDict
import inspect
from pydantic import BaseModel
from zon import ZonRecord

from goat.utils.create_tool_parameters import ToolParametersSchemaHolder
from goat.classes.wallet_client_base import WalletClientBase
from goat.utils.snake_case import snake_case


class ToolDecoratorParams(TypedDict):
    name: NotRequired[str]
    description: str
    parameters: ToolParametersSchemaHolder


class ParameterMetadata(TypedDict):
    index: int
    schema: Type[BaseModel]


class WalletClientMetadata(TypedDict):
    index: int | None


@dataclass
class StoredToolMetadata:
    name: str
    description: str
    target: Callable
    parameters: ParameterMetadata
    wallet_client: WalletClientMetadata


TOOL_METADATA_KEY = "__goat_tool__"


def Tool(tool_params: ToolDecoratorParams) -> Any:
    """
    Decorator that marks a class method as a tool accessible to the LLM.

    The decorator accepts configuration parameters and an optional schema for runtime parameter validation.
    When a schema is provided, all parameters passed to the tool will be validated against it before
    execution.

    Args:
        params: Either a ToolDecoratorParams instance or a dict containing:
            - description (str): A description of what the tool does
            - name (str, optional): Custom name for the tool. Defaults to the method name in snake_case
            - parameters (ZonRecord, optional): A Zon schema to validate parameters at runtime

    Returns:
        A decorated method that includes parameter validation and tool metadata

    Example:
        ```python
        class MyService:
            @Tool({
                "description": "Adds two numbers",
                "parameters": create_tool_parameters({"a": ZonNumber(), "b": ZonNumber()})
            })
            def add(self, params: dict) -> int:
                return params["a"] + params["b"]
        ```

    Raises:
        Exception: If the parameters fail schema validation at runtime
    """

    def decorator(func):
        # Validate parameters
        if not isinstance(
            tool_params.get("parameters", None), ToolParametersSchemaHolder
        ):
            raise ValueError("Tool parameters must be a ToolParameters instance")

        # Get validated parameters from method signature
        parameters_indexes = validate_decorator_parameters(func)

        # Store metadata on the function
        tool_metadata = StoredToolMetadata(
            name=tool_params.get("name", snake_case(func.__name__)),
            description=tool_params["description"],
            target=func,
            parameters={
                "index": parameters_indexes["parameters"],
                "schema": tool_params["parameters"].schema,
            },
            wallet_client={"index": parameters_indexes.get("wallet_client")},
        )

        # Store metadata directly on the function
        setattr(func, TOOL_METADATA_KEY, tool_metadata)

        return func

    return decorator


def validate_decorator_parameters(method: Callable) -> dict[str, int]:
    """
    Validates the parameters of a tool method to ensure it has the correct signature.

    Args:
        method: The method being decorated

    Returns:
        Dict containing validated parameter information
    """

    log_prefix = f"Method '{method.__name__}'"
    explainer = (
        "Tool methods must have at least one parameter that is a Zon schema class "
        "created with the create_tool_parameters function."
    )

    # Get method signature
    sig = inspect.signature(method)
    params = list(sig.parameters.values())

    if len(params) == 0:
        raise ValueError(f"{log_prefix} has no parameters. {explainer}")
    if len(params) > 3:  # we have self, params and wallet_client
        raise ValueError(f"{log_prefix} has {len(params)} parameters. {explainer}")

    # Find parameters that match our requirements
    parameters_index = None
    wallet_client_index = None

    for idx, param in enumerate(params):
        if isinstance(param.annotation, type) and issubclass(param.annotation, dict):
            parameters_index = idx
        elif isinstance(param.annotation, type) and issubclass(
            param.annotation, WalletClientBase
        ):
            wallet_client_index = idx

    if not parameters_index:
        raise ValueError(
            f"{log_prefix} has no parameters parameter.\n\n"
            f"1.) {explainer}\n\n"
            "2.) Ensure that you are using proper Zon schema annotations."
        )

    result = {"parameters": parameters_index}
    if wallet_client_index:
        result["wallet_client"] = wallet_client_index

    return result
