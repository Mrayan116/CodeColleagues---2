"""
Code Debugger service: turns (language, code, error, expectation) into a
structured Problem / Why / Hint / Fix / Explanation response.
"""
import uuid

from pydantic import BaseModel, Field

from app.schemas.common import Language
from app.schemas.debugger import Complexity, DebugResponse
from app.services.ai.utils import parse_json_response
from app.services.llm.base import LLMProvider

_SYSTEM_PROMPT = """You are Code Colleague's debugging tutor. A student has broken or \
misbehaving code. Diagnose it like a tutor, not an autocomplete: help them understand the bug, \
don't just hand over a fix without explanation.

Guidelines:
- "problem": one or two sentences stating what is actually wrong (not just restating the error).
- "why_it_happens": explain the underlying programming concept that makes this a bug (e.g. \
off-by-one indexing, mutable default argument, integer division, dangling pointer, missing base \
case). Teach the concept, don't just describe this one instance.
- "hint": a nudge the student can use to find the fix themselves BEFORE seeing the answer. \
Should not give away the exact fix.
- "suggested_fix": corrected code. Keep the student's structure/style where reasonable; fix the \
actual bug rather than rewriting everything.
- "explanation": why the fix works, tied back to the concept in why_it_happens.
- "concepts": 1-5 short tags, e.g. ["pointers", "off-by-one"].
- "complexity": your best-effort time/space complexity of the corrected code as short strings \
like "O(n)" — if not meaningfully applicable (e.g. trivial fix), use "O(1)" for both.

Respond with ONLY a JSON object (no markdown fences, no extra text) matching exactly:
{
  "problem": string,
  "why_it_happens": string,
  "hint": string,
  "suggested_fix": string,
  "explanation": string,
  "concepts": string[],
  "complexity": {"time": string, "space": string}
}"""


class _DebugLLMOutput(BaseModel):
    problem: str
    why_it_happens: str
    hint: str
    suggested_fix: str
    explanation: str
    concepts: list[str] = Field(default_factory=list)
    complexity: Complexity


async def debug_code(
    *,
    provider: LLMProvider,
    language: Language,
    code: str,
    error_message: str | None,
    expected_behavior: str | None,
    reveal_fix: bool,
) -> DebugResponse:
    user_prompt = _build_user_prompt(
        language=language, code=code, error_message=error_message, expected_behavior=expected_behavior
    )

    raw = await provider.complete(system_prompt=_SYSTEM_PROMPT, user_prompt=user_prompt, json_mode=True)
    parsed = parse_json_response(raw, _DebugLLMOutput)

    return DebugResponse(
        id=str(uuid.uuid4()),
        problem=parsed.problem,
        why_it_happens=parsed.why_it_happens,
        hint=parsed.hint,
        # The fix/explanation are only surfaced once the student asks for them —
        # Hint Mode's "reveal on request" behavior applies here too.
        suggested_fix=parsed.suggested_fix if reveal_fix else None,
        explanation=parsed.explanation if reveal_fix else None,
        concepts=parsed.concepts,
        complexity=parsed.complexity,
    )


def _build_user_prompt(
    *, language: Language, code: str, error_message: str | None, expected_behavior: str | None
) -> str:
    parts = [f"Language: {language.value}", "", "Code:", "```", code, "```"]
    if error_message:
        parts += ["", "Error message the student is seeing:", error_message]
    if expected_behavior:
        parts += ["", "What the student expected to happen instead:", expected_behavior]
    return "\n".join(parts)
