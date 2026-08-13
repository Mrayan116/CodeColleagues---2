from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import LearningActivity
from app.schemas.hint import HintRequest, HintResponse
from app.services.ai.hint import generate_hints
from app.services.llm.base import LLMError
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/hint", tags=["hint"])


@router.post("", response_model=HintResponse)
async def get_hints(payload: HintRequest, db: Session = Depends(get_db)) -> HintResponse:
    provider = get_llm_provider()

    try:
        result = await generate_hints(
            provider=provider,
            problem=payload.problem,
            code=payload.code,
            language=payload.language,
            skill_level=payload.skill_level,
            reveal_solution=payload.reveal_solution,
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        db.add(
            LearningActivity(
                activity_type="hint",
                topic=result.concepts[0] if result.concepts else None,
                summary=payload.problem[:120],
            )
        )
        db.commit()
    except Exception:
        db.rollback()

    return result
