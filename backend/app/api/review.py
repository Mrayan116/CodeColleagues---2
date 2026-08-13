from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import CodeReview, LearningActivity
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.ai.reviewer import review_code
from app.services.llm.base import LLMError
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/review", tags=["review"])


@router.post("", response_model=ReviewResponse)
async def review(payload: ReviewRequest, db: Session = Depends(get_db)) -> ReviewResponse:
    provider = get_llm_provider()

    try:
        result = await review_code(provider=provider, language=payload.language, code=payload.code)
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        db.add(
            CodeReview(
                id=result.id,
                language=payload.language.value,
                code=payload.code,
                result_json=result.model_dump_json(),
            )
        )
        critical_count = sum(1 for f in result.findings if f.severity.value == "critical")
        db.add(
            LearningActivity(
                activity_type="review",
                summary=f"Reviewed {payload.language.value} code — "
                f"{len(result.findings)} findings ({critical_count} critical)",
            )
        )
        db.commit()
    except Exception:
        db.rollback()

    return result
