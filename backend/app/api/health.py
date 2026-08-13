from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER,
    }
