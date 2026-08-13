from pydantic import BaseModel, Field

from app.schemas.common import Language


class DebugRequest(BaseModel):
    language: Language
    code: str = Field(min_length=1, max_length=20000)
    error_message: str | None = Field(default=None, max_length=4000)
    expected_behavior: str | None = Field(default=None, max_length=2000)
    reveal_fix: bool = False  # only include suggested_fix when true


class Complexity(BaseModel):
    time: str
    space: str


class DebugResponse(BaseModel):
    id: str
    problem: str
    why_it_happens: str
    hint: str
    suggested_fix: str | None = None
    explanation: str | None = None
    concepts: list[str] = Field(default_factory=list)
    complexity: Complexity | None = None
