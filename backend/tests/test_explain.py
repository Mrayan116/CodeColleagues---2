from tests.conftest import json_response

QUICK_EXPLAIN_LLM_OUTPUT = {
    "high_level": "This function returns the sum of a list of numbers using a loop.",
    "line_by_line": [],
    "concepts": ["loops", "accumulator pattern"],
    "inputs_outputs": "Takes a list of numbers, returns their sum.",
    "edge_cases": ["empty list"],
    "complexity": {"time": "O(n)", "space": "O(1)"},
}

DETAILED_EXPLAIN_LLM_OUTPUT = {
    **QUICK_EXPLAIN_LLM_OUTPUT,
    "line_by_line": [
        {"lines": "1", "explanation": "Defines the function and its parameter."},
        {"lines": "2-4", "explanation": "Iterates over the list, accumulating a running total."},
    ],
}


def test_explain_quick_returns_no_line_by_line(client, fake_llm):
    fake_llm.next_response = json_response(QUICK_EXPLAIN_LLM_OUTPUT)

    response = client.post(
        "/api/v1/explain",
        json={"language": "python", "code": "def total(nums):\n    return sum(nums)", "detail": "quick"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["line_by_line"] == []
    assert body["high_level"] == QUICK_EXPLAIN_LLM_OUTPUT["high_level"]


def test_explain_detailed_returns_line_by_line(client, fake_llm):
    fake_llm.next_response = json_response(DETAILED_EXPLAIN_LLM_OUTPUT)

    response = client.post(
        "/api/v1/explain",
        json={
            "language": "python",
            "code": "def total(nums):\n    result = 0\n    for n in nums:\n        result += n\n    return result",
            "detail": "detailed",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["line_by_line"]) == 2
