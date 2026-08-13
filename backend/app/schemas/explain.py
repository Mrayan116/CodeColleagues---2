from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import Language
from app.schemas.debugger import Complexity


class ExplainRequest(BaseModel):
    language: Language
    code: str = Field(min_length=1, max_length=20000)
    detail: Literal["quick", "detailed"] = "quick"


class LineExplanation(BaseModel):
    lines: str  # e.g. "3-5" or "line 12"
    explanation: str


class ExplainResponse(BaseModel):
    id: str
    high_level: str
    line_by_line: list[LineExplanation] = Field(default_factory=list)  # only populated for "detailed"
    concepts: list[str] = Field(default_factory=list)
    inputs_outputs: str
    edge_cases: list[str] = Field(default_factory=list)
    complexity: Complexity
