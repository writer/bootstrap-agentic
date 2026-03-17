import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.models import Base


class Thread(Base):
    __tablename__ = "threads"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String, default="New Chat")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
