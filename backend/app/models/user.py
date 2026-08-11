from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    tasks = relationship(
        "Task",
        back_populates="owner",
        cascade="all, delete",
    )

    notes = relationship(
        "Note",
        back_populates="owner",
        cascade="all, delete",
    )

    categories = relationship(
        "Category",
        back_populates="owner",
        cascade="all, delete",
    )

    chat_sessions = relationship(
        "ChatSession",
        back_populates="user",
        cascade="all, delete",
    )