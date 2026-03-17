import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.message import Message
from backend.models.thread import Thread
from backend.schemas.thread import MessageResponse


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_create_thread(client: AsyncClient):
    response = await client.post("/threads/", json={"title": "Test Thread"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Thread"
    assert "id" in data


@pytest.mark.asyncio
async def test_message_serialization(db_session: AsyncSession):
    thread = Thread(title="Serialization Test")
    db_session.add(thread)
    await db_session.flush()

    msg = Message(
        thread_id=thread.id,
        role="user",
        content="Hello, world!",
    )
    db_session.add(msg)
    await db_session.commit()

    data = MessageResponse.model_validate(msg)
    assert data.content == "Hello, world!"


@pytest.mark.asyncio
async def test_thread_messages_isolation(client: AsyncClient, db_session: AsyncSession):
    t1 = Thread(title="Thread A")
    t2 = Thread(title="Thread B")
    db_session.add_all([t1, t2])
    await db_session.flush()

    for i in range(3):
        db_session.add(Message(thread_id=t1.id, role="user", content=f"msg-a-{i}"))
    for i in range(2):
        db_session.add(Message(thread_id=t2.id, role="user", content=f"msg-b-{i}"))
    await db_session.commit()

    response = await client.get(f"/threads/{t1.id}")
    assert response.status_code == 200

    response = await client.get(f"/threads/{t1.id}/messages")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
