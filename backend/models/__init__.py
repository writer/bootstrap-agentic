from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from backend.models.message import Message  # noqa: E402, F401
from backend.models.thread import Thread  # noqa: E402, F401
