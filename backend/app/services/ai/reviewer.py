"""
Code Review service: analyzes submitted code and returns structured,
severity-tagged findings instead of a silent rewrite.
"""
import uuid

from pydantic import BaseModel, Field

from app.schemas.common import Language
from app.schemas.review import ReviewFinding, ReviewResponse
from app.services.ai.utils import parse_json_response
from app.services.llm.base import LLMProvider

_SYSTEM_PROMPT = """You are Code Colleague's code reviewer, reviewing a student's code for a \
university programming course. Analyze it like an experienced engineer mentoring a junior, not \
a linter dumping every nitpick.

Look for: bugs, code smells, potential runtime issues, security concerns (if applicable), \
performance issues, readability, maintainability, naming, and unnecessary complexity.

Rules:
- Do NOT simply rewrite the whole file. Identify specific findings with locations.
- Each finding needs a severity: "critical" (will break / seriously wrong), "warning" (likely \
bug or bad practice), "improvement" (would meaningfully improve quality), or "suggestion" \
(minor, stylistic, or optional).
- "location" should point at something findable: a line number, function name, or short quoted \
identifier — not "somewhere in the code".
- Also note 0-4 genuine strengths — things the student did well. Skip this if the code has none.
- Be specific and actionable in "suggestion": say what to change, not just that something is wrong.

Respond with ONLY a JSON object (no markdown fences, no extra text) matching exactly:
{
  "summary": string,   // 1-3 sentence overall assessment
  "findings": [
    {
      "severity": "critical" | "warning" | "improvement" | "suggestion",
      "location": string,
      "problem": string,
      "explanation": string,
      "suggestion": string
    }
  ],
  "strengths": string[]
}"""


class _ReviewLLMOutput(BaseModel):
    summary: str
    findings: list[ReviewFinding] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)


async def review_code(*, provider: LLMProvider, language: Language, code: str) -> ReviewResponse:
    user_prompt = f"Language: {language.value}\n\nCode:\n```\n{code}\n```"

    raw = await provider.complete(system_prompt=_SYSTEM_PROMPT, user_prompt=user_prompt, json_mode=True)
    parsed = parse_json_response(raw, _ReviewLLMOutput)

    return ReviewResponse(
        id=str(uuid.uuid4()),
        summary=parsed.summary,
        findings=parsed.findings,
        strengths=parsed.strengths,
    )
