"""
Practice Question Generator service: produces N problems for a given
language/topic/difficulty, each with hints and a solution the frontend
keeps hidden until the student asks.
"""
import uuid

from pydantic import BaseModel, Field

from app.schemas.common import Difficulty, Language
from app.schemas.practice import PracticeQuestion, PracticeResponse
from app.services.ai.utils import parse_json_response
from app.services.llm.base import LLMProvider

_SYSTEM_PROMPT = """You are CodeMentor's practice question generator, writing original practice \
problems for a university programming course.

Generate exactly {count} {difficulty}-difficulty {language} practice problem(s) about: {topic}.

For each problem:
- "title": short, descriptive (a few words).
- "problem_statement": a clear, self-contained problem description a student could solve without \
further clarification.
- "example_input" / "example_output": one concrete worked example.
- "constraints": 0-4 short constraints (input size, value ranges, etc.) — omit if not applicable.
- "hints": exactly 2 hints of increasing specificity, in the SAME progressive-hint spirit as the \
rest of the app — conceptual nudge first, more direction second. Neither should give away the \
full solution.
- "solution": a complete, correct solution with a short explanation of the approach.

Respond with ONLY a JSON object (no markdown fences, no extra text) matching exactly:
{{
  "questions": [
    {{
      "title": string,
      "problem_statement": string,
      "example_input": string,
      "example_output": string,
      "constraints": string[],
      "hints": string[],
      "solution": string
    }}
  ]
}}"""


class _PracticeLLMOutput(BaseModel):
    questions: list[PracticeQuestion] = Field(default_factory=list)


async def generate_practice_questions(
    *, provider: LLMProvider, language: Language, topic: str, difficulty: Difficulty, count: int
) -> PracticeResponse:
    system_prompt = _SYSTEM_PROMPT.format(
        count=count, difficulty=difficulty.value, language=language.value, topic=topic
    )

    raw = await provider.complete(
        system_prompt=system_prompt,
        user_prompt=f"Generate the {count} problem(s) now.",
        json_mode=True,
    )
    parsed = parse_json_response(raw, _PracticeLLMOutput)

    return PracticeResponse(
        id=str(uuid.uuid4()),
        language=language,
        topic=topic,
        difficulty=difficulty,
        questions=parsed.questions,
    )
