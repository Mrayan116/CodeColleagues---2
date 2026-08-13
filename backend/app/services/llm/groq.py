from groq import AsyncGroq, GroqError

from app.core.config import get_settings
from app.services.llm.base import LLMError, LLMProvider

settings = get_settings()


class GroqProvider(LLMProvider):
    """Default development provider — Groq has a free tier, which is why the
    project defaults to it. Swap LLM_PROVIDER=openai in .env for OpenAI.
    """

    def __init__(self) -> None:
        if not settings.GROQ_API_KEY:
            raise LLMError(
                "GROQ_API_KEY is not set. Add it to backend/.env "
                "(see backend/.env.example)."
            )
        self._client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self._model = settings.GROQ_MODEL

    async def complete(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float | None = None,
        max_tokens: int | None = None,
        json_mode: bool = False,
    ) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature if temperature is not None else settings.LLM_TEMPERATURE,
                max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
                response_format={"type": "json_object"} if json_mode else None,
            )
        except GroqError as exc:
            raise LLMError(f"Groq request failed: {exc}") from exc

        content = response.choices[0].message.content
        if not content:
            raise LLMError("Groq returned an empty response.")
        return content

    async def chat(
        self,
        *,
        system_prompt: str,
        messages: list[dict[str, str]],
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[{"role": "system", "content": system_prompt}, *messages],
                temperature=temperature if temperature is not None else settings.LLM_TEMPERATURE,
                max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
            )
        except GroqError as exc:
            raise LLMError(f"Groq request failed: {exc}") from exc

        content = response.choices[0].message.content
        if not content:
            raise LLMError("Groq returned an empty response.")
        return content
