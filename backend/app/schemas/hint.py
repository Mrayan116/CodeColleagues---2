from pydantic import BaseModel, Field

from app.schemas.common import Language, SkillLevel


class HintRequest(BaseModel):
    problem: str = Field(min_length=1, max_length=4000, description="What the student is stuck on.")
    code: str | None = Field(default=None, max_length=20000, description="The student's attempt so far, if any.")
    language: Language | None = None
    skill_level: SkillLevel = SkillLevel.beginner
    reveal_solution: bool = False


class HintResponse(BaseModel):
    id: str
    hint_1: str
    hint_2: str
    hint_3: str
    solution: str | None = None
    concepts: list[str] = Field(default_factory=list)
