from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import LearningActivity
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.ai.explainer import explain_code
from app.services.llm.base import LLMError
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/explain", tags=["explain"])


@router.post("", response_model=ExplainResponse)
async def explain(payload: ExplainRequest, db: Session = Depends(get_db)) -> ExplainResponse:
    provider = get_llm_provider()

    try:
        result = await explain_code(
            provider=provider, language=payload.language, code=payload.code, detail=payload.detail
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        db.add(
            LearningActivity(
                activity_type="explain",
                topic=result.concepts[0] if result.concepts else None,
                summary=f"Explained {payload.language.value} code ({payload.detail})",
            )
        )
        db.commit()
    except Exception:
        db.rollback()

    return result
