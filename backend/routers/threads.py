from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.agent.loop import run_agent
from backend.db import get_db
from backend.models.message import Message
from backend.models.thread import Thread
from backend.schemas.thread import (
    ChatRequest,
    ChatResponse,
    MessageResponse,
    ThreadCreate,
    ThreadResponse,
)

router = APIRouter(prefix="/threads", tags=["threads"])


@router.get("/", response_model=list[ThreadResponse])
async def list_threads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Thread).order_by(Thread.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=ThreadResponse)
async def create_thread(body: ThreadCreate, db: AsyncSession = Depends(get_db)):
    thread = Thread(title=body.title)
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return thread


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread(thread_id: str, db: AsyncSession = Depends(get_db)):
    thread = await db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread


@router.post("/{thread_id}/chat", response_model=ChatResponse)
async def chat(
    thread_id: str, body: ChatRequest, db: AsyncSession = Depends(get_db)
):
    thread = await db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    response_text = await run_agent(thread_id, body.message, db)

    # Fetch all messages for this thread to return
    result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    return ChatResponse(
        thread_id=thread_id,
        response=response_text,
        messages=[MessageResponse.model_validate(m) for m in messages],
    )
