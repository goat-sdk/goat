from dataclasses import dataclass
from typing import Type
from pydantic import BaseModel


@dataclass
class ToolParametersSchemaHolder:
    schema: Type[BaseModel]


def create_tool_parameters(schema: Type[BaseModel]) -> ToolParametersSchemaHolder:
    # Check if schema is an instance of ZonRecord
    if not issubclass(schema, BaseModel):
        raise ValueError(f"Schema must be a subclass of BaseModel")

    return ToolParametersSchemaHolder(schema)
