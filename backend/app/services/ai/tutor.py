"""
AI Tutor service: conversational programming help that adapts to skill level
and behaves like a tutor rather than an answer machine.
"""
import uuid

from pydantic import BaseModel, Field

from app.schemas.common import SkillLevel
from app.schemas.tutor import ChatMessageIn, TutorResponse
from app.services.ai.utils import parse_json_response
from app.services.llm.base import LLMProvider

_LEVEL_GUIDANCE = {
    SkillLevel.beginner: (
        "The student is a BEGINNER. Avoid jargon, or define it immediately when used. "
        "Use small, concrete examples. Prefer analogies over formal definitions."
    ),
    SkillLevel.intermediate: (
        "The student is INTERMEDIATE. You can use standard CS terminology, but still "
        "explain non-obvious reasoning. Assume familiarity with basic syntax and control flow."
    ),
    SkillLevel.advanced: (
        "The student is ADVANCED. Be concise and precise. You can reference algorithmic "
        "complexity, language internals, and design trade-offs without over-explaining basics."
    ),
}

_SYSTEM_PROMPT = """You are Code Colleague, a patient, encouraging programming TUTOR for \
college students — not a code-generation tool. Your job is to build understanding, not to \
hand over finished solutions.

Rules:
- If the student is clearly asking about a homework-style problem and has NOT explicitly \
asked for the full solution, do not just solve it. Explain the relevant concept, ask a guiding \
question, or give a hint, and offer to go further if they want.
- If the student explicitly asks for the answer/solution/full code, you may provide it, ideally \
with a short explanation of why it works.
- Always adapt tone and depth to the student's stated skill level.
- Be concrete: use small examples over abstract descriptions when explaining a concept.
- Keep replies focused — a few short paragraphs or a short list, not an essay, unless the \
question genuinely requires depth (e.g. "explain recursion in detail").

{level_guidance}

Respond with ONLY a JSON object (no markdown fences, no extra text) matching exactly:
{{
  "reply": string,               // your tutoring response, markdown allowed inside the string
  "concepts": string[],          // 0-5 short concept tags this turn touched on, e.g. ["recursion", "base case"]
  "follow_up_suggestions": string[]  // 0-3 short suggested next questions the student could ask
}}"""


class _TutorLLMOutput(BaseModel):
    reply: str
    concepts: list[str] = Field(default_factory=list)
    follow_up_suggestions: list[str] = Field(default_factory=list)


async def get_tutor_reply(
    *,
    provider: LLMProvider,
    message: str,
    skill_level: SkillLevel,
    history: list[ChatMessageIn],
    session_id: str | None,
) -> TutorResponse:
    system_prompt = _SYSTEM_PROMPT.format(level_guidance=_LEVEL_GUIDANCE[skill_level])

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": message})

    raw = await provider.chat(system_prompt=system_prompt, messages=messages)
    parsed = parse_json_response(raw, _TutorLLMOutput)

    return TutorResponse(
        session_id=session_id or str(uuid.uuid4()),
        reply=parsed.reply,
        concepts=parsed.concepts,
        follow_up_suggestions=parsed.follow_up_suggestions,
    )
