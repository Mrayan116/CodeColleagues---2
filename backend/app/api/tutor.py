from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import LearningActivity
from app.models.session import ChatMessage, ChatSession
from app.schemas.tutor import (
    ChatMessageOut,
    ChatSessionDetail,
    ChatSessionSummary,
    TutorRequest,
    TutorResponse,
)
from app.services.ai.tutor import get_tutor_reply
from app.services.llm.base import LLMError
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/tutor", tags=["tutor"])


@router.post("", response_model=TutorResponse)
async def chat_with_tutor(payload: TutorRequest, db: Session = Depends(get_db)) -> TutorResponse:
    provider = get_llm_provider()

    try:
        result = await get_tutor_reply(
            provider=provider,
            message=payload.message,
            skill_level=payload.skill_level,
            history=payload.history,
            session_id=payload.session_id,
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    _persist(db, payload, result)
    return result


def _persist(db: Session, payload: TutorRequest, result: TutorResponse) -> None:
    """Best-effort persistence. A DB hiccup here shouldn't fail a chat reply
    the student is actively waiting on, so failures are swallowed."""
    try:
        session = db.get(ChatSession, result.session_id)
        if session is None:
            session = ChatSession(
                id=result.session_id,
                title=payload.message[:80],
                skill_level=payload.skill_level.value,
            )
            db.add(session)
        else:
            # Touch the row so `updated_at` bumps (via onupdate) and sessions
            # sort by most-recent activity, not just creation time.
            session.skill_level = payload.skill_level.value

        db.add(ChatMessage(session_id=result.session_id, role="user", content=payload.message))
        db.add(ChatMessage(session_id=result.session_id, role="assistant", content=result.reply))
        db.add(
            LearningActivity(
                activity_type="tutor",
                topic=result.concepts[0] if result.concepts else None,
                summary=payload.message[:120],
            )
        )
        db.commit()
    except Exception:
        db.rollback()


# --- Chat history (Phase 2) ---


@router.get("/sessions", response_model=list[ChatSessionSummary])
def list_chat_sessions(db: Session = Depends(get_db), limit: int = 30) -> list[ChatSessionSummary]:
    rows = (
        db.query(
            ChatSession,
            func.count(ChatMessage.id).label("message_count"),
        )
        .outerjoin(ChatMessage, ChatMessage.session_id == ChatSession.id)
        .group_by(ChatSession.id)
        .order_by(desc(ChatSession.updated_at))
        .limit(limit)
        .all()
    )
    return [
        ChatSessionSummary(
            id=session.id,
            title=session.title,
            skill_level=session.skill_level,
            message_count=message_count,
            updated_at=session.updated_at,
        )
        for session, message_count in rows
    ]


@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
def get_chat_session(session_id: str, db: Session = Depends(get_db)) -> ChatSessionDetail:
    session = db.get(ChatSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return ChatSessionDetail(
        id=session.id,
        title=session.title,
        skill_level=session.skill_level,
        messages=[
            ChatMessageOut(role=m.role, content=m.content, created_at=m.created_at) for m in messages
        ],
    )
