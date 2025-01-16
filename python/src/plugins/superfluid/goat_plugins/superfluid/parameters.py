from pydantic import BaseModel, Field


class FlowParameters(BaseModel):
    token: str = Field(description="The address of the Super Token to get the flow of")
    receiver: str = Field(description="The address of the receiver of the flow")
    flowrate: str = Field(description="The flowrate of the flow in wei per second (must be a valid int96 value)")


class GetFlowrateParameters(BaseModel):
    token: str = Field(description="The address of the Super Token to get the flow of")
    sender: str = Field(description="The address of the sender of the flow")
    receiver: str = Field(description="The address of the receiver of the flow")


class UpdateMemberUnitsParameters(BaseModel):
    poolAddress: str = Field(description="The address of the Pool contract")
    memberAddr: str = Field(description="The address of the member to update units for")
    newUnits: int = Field(description="The new units amount for the member")


class GetUnitsParameters(BaseModel):
    poolAddress: str = Field(description="The address of the Pool contract")
    memberAddr: str = Field(description="The address of the member to get units for")


class GetMemberFlowRateParameters(BaseModel):
    poolAddress: str = Field(description="The address of the Pool contract")
    memberAddr: str = Field(description="The address of the member to get flow rate for")


class GetTotalFlowRateParameters(BaseModel):
    poolAddress: str = Field(description="The address of the Pool contract")
