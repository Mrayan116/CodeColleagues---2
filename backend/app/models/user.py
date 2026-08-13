"""
User model.

Phase 1 ships without authentication (see README), but the schema already
carries the fields a future auth system needs so we don't have to migrate
around it later.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(100), default="Student")
    skill_level: Mapped[str] = mapped_column(String(20), default="beginner")  # beginner|intermediate|advanced
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
