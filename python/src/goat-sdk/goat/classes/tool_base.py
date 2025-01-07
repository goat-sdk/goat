from abc import ABC, abstractmethod
from typing import (
    Any,
    Callable,
    Generic,
    Type,
    TypeVar,
    TypedDict,
)
from pydantic import BaseModel

TResult = TypeVar("TResult")


class ToolConfig(TypedDict):
    """
    Configuration interface for creating a Tool

    Generic Parameters:
        TParameters: The Zon schema type for the tool's parameters

    Attributes:
        name: The name of the tool
        description: A description of what the tool does
        parameters: The Zon schema defining the tool's parameters
    """

    name: str
    description: str
    parameters: Type[BaseModel]


class ToolBase(Generic[TResult], ABC):
    """Abstract base class for creating tools with typed results"""

    name: str
    description: str
    parameters: Type[BaseModel]

    def __init__(self, config: ToolConfig):
        """
        Creates a new Tool instance

        Args:
            config: The configuration object for the tool
        """
        super().__init__()
        self.name = config["name"]
        self.description = config["description"]
        self.parameters = config["parameters"]

    @abstractmethod
    def execute(self, parameters: dict[str, Any]) -> TResult:
        """
        Executes the tool with the provided parameters

        Args:
            parameters: The parameters for the tool execution, validated against the tool's schema

        Returns:
            The result of the tool execution
        """
        pass


def create_tool(
    config: ToolConfig, execute_fn: Callable[[dict[str, Any]], TResult]
) -> ToolBase[TResult]:
    """
    Creates a new Tool instance with the provided configuration and execution function

    Args:
        config: The configuration object for the tool
        execute_fn: The function to be called when the tool is executed

    Returns:
        A new Tool instance
    """

    class Tool(ToolBase):
        def execute(self, parameters: dict[str, Any]) -> TResult:
            # Validate parameters using the tool's schema before executing
            validated_params = self.parameters.model_validate(parameters)
            return execute_fn(validated_params.model_dump())

    return Tool(config)
