"""
Explain Code service: high-level + optional line-by-line breakdown of a
snippet, with concepts, I/O, edge cases, and complexity.
"""
import uuid

from pydantic import BaseModel, Field

from app.schemas.common import Language
from app.schemas.debugger import Complexity
from app.schemas.explain import ExplainResponse, LineExplanation
from app.services.ai.utils import parse_json_response
from app.services.llm.base import LLMProvider

_SYSTEM_PROMPT = """You are CodeMentor's code explainer, helping a student understand a piece of \
code they didn't necessarily write themselves (or wrote but don't fully understand).

Detail level requested: {detail}.
{detail_instructions}

Rules:
- "high_level": 2-4 sentences on what the code does and how, at a conceptual level.
- "line_by_line": {line_by_line_instruction}
- "concepts": 1-6 short tags for the concepts/techniques used (e.g. "recursion", "hash map").
- "inputs_outputs": what the code takes in and what it returns/produces, in plain language.
- "edge_cases": 0-5 inputs or situations worth thinking about (empty input, negative numbers, \
duplicates, very large input, etc.) — only include ones actually relevant to this code.
- "complexity": your best-effort Big-O time and space complexity, as short strings like "O(n)".

Respond with ONLY a JSON object (no markdown fences, no extra text) matching exactly:
{{
  "high_level": string,
  "line_by_line": [{{"lines": string, "explanation": string}}],
  "concepts": string[],
  "inputs_outputs": string,
  "edge_cases": string[],
  "complexity": {{"time": string, "space": string}}
}}"""

_DETAIL_INSTRUCTIONS = {
    "quick": "Keep everything brief — this is a fast overview, not a deep dive.",
    "detailed": "Take your time — the student wants to actually understand every part.",
}

_LINE_BY_LINE_INSTRUCTIONS = {
    "quick": "return an EMPTY array — quick mode skips line-by-line detail.",
    "detailed": "break the code into logical chunks (a few lines each, not literally "
    "one entry per line) and explain what each chunk does.",
}


class _ExplainLLMOutput(BaseModel):
    high_level: str
    line_by_line: list[LineExplanation] = Field(default_factory=list)
    concepts: list[str] = Field(default_factory=list)
    inputs_outputs: str
    edge_cases: list[str] = Field(default_factory=list)
    complexity: Complexity


async def explain_code(
    *, provider: LLMProvider, language: Language, code: str, detail: str
) -> ExplainResponse:
    system_prompt = _SYSTEM_PROMPT.format(
        detail=detail,
        detail_instructions=_DETAIL_INSTRUCTIONS[detail],
        line_by_line_instruction=_LINE_BY_LINE_INSTRUCTIONS[detail],
    )
    user_prompt = f"Language: {language.value}\n\nCode:\n```\n{code}\n```"

    raw = await provider.complete(system_prompt=system_prompt, user_prompt=user_prompt, json_mode=True)
    parsed = parse_json_response(raw, _ExplainLLMOutput)

    return ExplainResponse(
        id=str(uuid.uuid4()),
        high_level=parsed.high_level,
        line_by_line=parsed.line_by_line,
        concepts=parsed.concepts,
        inputs_outputs=parsed.inputs_outputs,
        edge_cases=parsed.edge_cases,
        complexity=parsed.complexity,
    )
