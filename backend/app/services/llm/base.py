"""
LLM provider abstraction.

Every provider (Groq, OpenAI, ...) implements this interface so the rest of
the app never talks to a vendor SDK directly. Swapping providers is a one-line
change in app/core/config.py (LLM_PROVIDER) plus the matching API key.
"""
from abc import ABC, abstractmethod


class LLMError(Exception):
    """Raised when the provider fails or returns something unusable."""


class LLMProvider(ABC):
    @abstractmethod
    async def complete(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float | None = None,
        max_tokens: int | None = None,
        json_mode: bool = False,
    ) -> str:
        """Return the raw text completion for a single-turn prompt.

        When json_mode=True, the provider should instruct the model to return
        ONLY a JSON object (no markdown fences, no prose) — callers are still
        responsible for parsing + Pydantic validation on their end.
        """
        raise NotImplementedError

    @abstractmethod
    async def chat(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, str]],
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Return the assistant's reply for a multi-turn conversation.

        `messages` is a list of {"role": "user"|"assistant", "content": str}.
        """
        raise NotImplementedError
