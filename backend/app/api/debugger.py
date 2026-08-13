from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import DebugSession, LearningActivity
from app.schemas.debugger import DebugRequest, DebugResponse
from app.services.ai.debugger import debug_code
from app.services.llm.base import LLMError
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/debugger", tags=["debugger"])

SUPPORTED_LANGUAGES = ["python", "java", "cpp", "c"]


@router.get("/languages")
def list_supported_languages() -> dict:
    return {"languages": SUPPORTED_LANGUAGES}


@router.post("", response_model=DebugResponse)
async def debug(payload: DebugRequest, db: Session = Depends(get_db)) -> DebugResponse:
    provider = get_llm_provider()

    try:
        result = await debug_code(
            provider=provider,
            language=payload.language,
            code=payload.code,
            error_message=payload.error_message,
            expected_behavior=payload.expected_behavior,
            reveal_fix=payload.reveal_fix,
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        db.add(
            DebugSession(
                id=result.id,
                language=payload.language.value,
                code=payload.code,
                error_message=payload.error_message,
                expected_behavior=payload.expected_behavior,
                result_json=result.model_dump_json(),
            )
        )
        db.add(
            LearningActivity(
                activity_type="debug",
                topic=result.concepts[0] if result.concepts else None,
                summary=result.problem[:120],
            )
        )
        db.commit()
    except Exception:
        db.rollback()

    return result
