from datetime import datetime

from pydantic import BaseModel


class ThreadCreate(BaseModel):
    title: str = "New Chat"


class ThreadResponse(BaseModel):
    id: str
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: str
    thread_id: str
    role: str
    content: int
    tool_call_id: str | None = None
    tool_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    thread_id: str
    response: str
    messages: list[MessageResponse]
