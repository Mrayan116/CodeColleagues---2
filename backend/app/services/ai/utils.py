"""
Shared helpers for turning raw LLM text into validated Pydantic models.

We never trust the model to (a) return valid JSON or (b) return JSON that
matches our schema. Both are handled here, with one retry on failure, so
individual services don't each reinvent this.
"""
import json
import re
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from app.services.llm.base import LLMError

T = TypeVar("T", bound=BaseModel)

_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _strip_code_fences(text: str) -> str:
    return _FENCE_RE.sub("", text.strip()).strip()


def parse_json_response(raw_text: str, schema: type[T]) -> T:
    """Parse `raw_text` as JSON and validate it against `schema`.

    Raises LLMError with a descriptive message on failure so callers can
    decide how to surface it (e.g. a 502 to the client) instead of leaking
    a raw stack trace.
    """
    cleaned = _strip_code_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise LLMError(f"Model did not return valid JSON: {exc}") from exc

    try:
        return schema.model_validate(data)
    except ValidationError as exc:
        raise LLMError(f"Model JSON did not match the expected schema: {exc}") from exc
