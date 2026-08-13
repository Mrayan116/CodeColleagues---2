"""
Hint Mode service: the app's signature progressive-help feature. Generates a
Problem -> Hint 1 -> Hint 2 -> Hint 3 -> Solution ladder for whatever the
student is stuck on (a concept, a homework problem, or their own broken
code) — distinct from the Debugger, which is specifically for diagnosing a
runtime error or wrong output.
"""
import uuid

from pydantic import BaseModel, Field

from app.schemas.common import Language, SkillLevel
from app.schemas.hint import HintResponse
from app.services.ai.utils import parse_json_response
from app.services.llm.base import LLMProvider

_SYSTEM_PROMPT = """You are CodeMentor's Hint Mode — the tutor's slow-reveal help system for a \
student who is stuck. Your job is to build understanding progressively, never to just answer.

Produce exactly three hints of increasing specificity, plus a full solution:
- "hint_1": a subtle, conceptual nudge. Should NOT reference specific code or the exact fix — \
just point at what to think about.
- "hint_2": more specific direction — narrows down where in their approach or code to focus.
- "hint_3": a strong hint that almost gives away the approach, but stops short of full code.
- "solution": the complete solution (code if this is a coding problem, or a full worked \
explanation if conceptual), with a brief explanation of why it works.
- "concepts": 1-5 short tags for what this problem touches on.

Adapt depth and vocabulary to the student's skill level: {level_guidance}

Respond with ONLY a JSON object (no markdown fences, no extra text) matching exactly:
{{
  "hint_1": string,
  "hint_2": string,
  "hint_3": string,
  "solution": string,
  "concepts": string[]
}}"""

_LEVEL_GUIDANCE = {
    SkillLevel.beginner: "avoid jargon, use small concrete examples in hints.",
    SkillLevel.intermediate: "standard CS terminology is fine.",
    SkillLevel.advanced: "be concise; you can reference complexity and design trade-offs.",
}


class _HintLLMOutput(BaseModel):
    hint_1: str
    hint_2: str
    hint_3: str
    solution: str
    concepts: list[str] = Field(default_factory=list)


async def generate_hints(
    *,
    provider: LLMProvider,
    problem: str,
    code: str | None,
    language: Language | None,
    skill_level: SkillLevel,
    reveal_solution: bool,
) -> HintResponse:
    system_prompt = _SYSTEM_PROMPT.format(level_guidance=_LEVEL_GUIDANCE[skill_level])

    prompt_parts = [f"What the student is stuck on:\n{problem}"]
    if language:
        prompt_parts.append(f"\nLanguage: {language.value}")
    if code:
        prompt_parts.append(f"\nThe student's attempt so far:\n```\n{code}\n```")
    user_prompt = "\n".join(prompt_parts)

    raw = await provider.complete(system_prompt=system_prompt, user_prompt=user_prompt, json_mode=True)
    parsed = parse_json_response(raw, _HintLLMOutput)

    return HintResponse(
        id=str(uuid.uuid4()),
        hint_1=parsed.hint_1,
        hint_2=parsed.hint_2,
        hint_3=parsed.hint_3,
        solution=parsed.solution if reveal_solution else None,
        concepts=parsed.concepts,
    )
