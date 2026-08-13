from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import LearningActivity, PracticeSet
from app.schemas.practice import PracticeRequest, PracticeResponse
from app.services.ai.practice import generate_practice_questions
from app.services.llm.base import LLMError
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/practice", tags=["practice"])


@router.post("", response_model=PracticeResponse)
async def generate_practice(payload: PracticeRequest, db: Session = Depends(get_db)) -> PracticeResponse:
    provider = get_llm_provider()

    try:
        result = await generate_practice_questions(
            provider=provider,
            language=payload.language,
            topic=payload.topic,
            difficulty=payload.difficulty,
            count=payload.count,
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        db.add(
            PracticeSet(
                id=result.id,
                language=payload.language.value,
                topic=payload.topic,
                difficulty=payload.difficulty.value,
                result_json=result.model_dump_json(),
            )
        )
        db.add(
            LearningActivity(
                activity_type="practice",
                topic=payload.topic,
                summary=f"Generated {len(result.questions)} {payload.difficulty.value} "
                f"{payload.language.value} question(s) on {payload.topic}",
            )
        )
        db.commit()
    except Exception:
        db.rollback()

    return result
