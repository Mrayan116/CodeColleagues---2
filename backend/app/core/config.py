"""
Application configuration.

All configuration is loaded from environment variables (see .env.example).
Nothing here is hard-coded, especially not API keys.
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_NAME: str = "Code Colleague"
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- Database ---
    DATABASE_URL: str = "postgresql+psycopg2://codecolleague:codecolleague@localhost:5432/codecolleague"

    # --- LLM Provider ---
    # Which provider implementation to use. Add new providers in app/services/llm/
    # and register them in app/services/llm/factory.py.
    LLM_PROVIDER: Literal["groq", "openai"] = "groq"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Generation controls
    LLM_TEMPERATURE: float = 0.3
    LLM_MAX_TOKENS: int = 2000

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
