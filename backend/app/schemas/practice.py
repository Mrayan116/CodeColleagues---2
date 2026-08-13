from pydantic import BaseModel, Field

from app.schemas.common import Difficulty, Language


class PracticeRequest(BaseModel):
    language: Language
    topic: str = Field(min_length=1, max_length=60)
    difficulty: Difficulty
    count: int = Field(default=3, ge=1, le=5)


class PracticeQuestion(BaseModel):
    title: str
    problem_statement: str
    example_input: str
    example_output: str
    constraints: list[str] = Field(default_factory=list)
    hints: list[str] = Field(default_factory=list)
    solution: str


class PracticeResponse(BaseModel):
    id: str
    language: Language
    topic: str
    difficulty: Difficulty
    questions: list[PracticeQuestion] = Field(default_factory=list)
