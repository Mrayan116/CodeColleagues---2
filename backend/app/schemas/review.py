from pydantic import BaseModel, Field

from app.schemas.common import Language, Severity


class ReviewRequest(BaseModel):
    language: Language
    code: str = Field(min_length=1, max_length=20000)


class ReviewFinding(BaseModel):
    severity: Severity
    location: str  # e.g. "line 14" or "function calculate_total"
    problem: str
    explanation: str
    suggestion: str


class ReviewResponse(BaseModel):
    id: str
    summary: str
    findings: list[ReviewFinding] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
