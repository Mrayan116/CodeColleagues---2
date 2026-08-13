from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import SkillLevel


class ChatMessageIn(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str


class TutorRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(min_length=1, max_length=8000)
    skill_level: SkillLevel = SkillLevel.beginner
    # Prior turns, oldest first. Kept client-side/stateless-friendly for Phase 1;
    # a session_id + DB history can replace this once auth lands.
    history: list[ChatMessageIn] = Field(default_factory=list)


class TutorResponse(BaseModel):
    session_id: str
    reply: str
    concepts: list[str] = Field(default_factory=list)
    follow_up_suggestions: list[str] = Field(default_factory=list)


# --- Chat history (Phase 2) ---


class ChatSessionSummary(BaseModel):
    id: str
    title: str
    skill_level: str
    message_count: int
    updated_at: datetime


class ChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime


class ChatSessionDetail(BaseModel):
    id: str
    title: str
    skill_level: str
    messages: list[ChatMessageOut]
