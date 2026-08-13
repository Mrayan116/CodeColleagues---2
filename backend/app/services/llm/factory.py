"""
Provider factory. This is the ONLY place that should decide which
LLMProvider implementation gets used, based on LLM_PROVIDER in the env.

Cached with lru_cache so we don't re-construct an SDK client per request.
"""
from functools import lru_cache

from app.core.config import get_settings
from app.services.llm.base import LLMProvider

settings = get_settings()


@lru_cache
def get_llm_provider() -> LLMProvider:
    if settings.LLM_PROVIDER == "groq":
        from app.services.llm.groq import GroqProvider

        return GroqProvider()
    if settings.LLM_PROVIDER == "openai":
        from app.services.llm.openai import OpenAIProvider

        return OpenAIProvider()

    raise ValueError(f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}")
