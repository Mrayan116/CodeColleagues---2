"""
Models for debugger sessions, code reviews, practice questions, and the
learning-activity log that powers the dashboard.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DebugSession(Base):
    __tablename__ = "debug_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    language: Mapped[str] = mapped_column(String(30))
    code: Mapped[str] = mapped_column(Text)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_behavior: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_json: Mapped[str] = mapped_column(Text)  # serialized DebuggerResponse

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CodeReview(Base):
    __tablename__ = "code_reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    language: Mapped[str] = mapped_column(String(30))
    code: Mapped[str] = mapped_column(Text)
    result_json: Mapped[str] = mapped_column(Text)  # serialized CodeReviewResponse

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PracticeSet(Base):
    __tablename__ = "practice_sets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    language: Mapped[str] = mapped_column(String(30))
    topic: Mapped[str] = mapped_column(String(60))
    difficulty: Mapped[str] = mapped_column(String(20))
    result_json: Mapped[str] = mapped_column(Text)  # serialized list[PracticeQuestion]

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LearningActivity(Base):
    """A lightweight event log: one row per meaningful student action.

    The dashboard aggregates over this table rather than each feature table
    directly, so new activity-producing features only need to insert here.
    """

    __tablename__ = "learning_activity"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    activity_type: Mapped[str] = mapped_column(String(30))  # tutor|debug|review|practice|explain
    topic: Mapped[str | None] = mapped_column(String(60), nullable=True)
    summary: Mapped[str] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
