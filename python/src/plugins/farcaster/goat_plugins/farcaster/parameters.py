from pydantic import BaseModel, Field
from typing import Optional


class GetCastParameters(BaseModel):
    identifier: str = Field(..., description="Cast URL or hash identifier")
    type: str = Field("hash", description="Type of identifier (url or hash)")


class PublishCastParameters(BaseModel):
    signer_uuid: str = Field(..., description="Unique ID of the signer publishing the cast")
    text: str = Field(..., description="Contents of the cast")
    parent: Optional[str] = Field(None, description="Parent cast hash if this is a reply")
    channel_id: Optional[str] = Field(None, description="Channel ID if posting to a specific channel")


class SearchCastsParameters(BaseModel):
    query: str = Field(..., description="Text query to find matching casts")
    limit: Optional[int] = Field(20, description="Max results to retrieve")


class GetConversationParameters(BaseModel):
    identifier: str = Field(..., description="Cast URL or hash identifier")
    type: str = Field("hash", description="Type of identifier (url or hash)")
    reply_depth: Optional[int] = Field(2, description="Depth of replies to fetch (0-5)")
    limit: Optional[int] = Field(20, description="Max results in conversation")
