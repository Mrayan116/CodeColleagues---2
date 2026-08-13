from tests.conftest import json_response

VALID_REVIEW_LLM_OUTPUT = {
    "summary": "Mostly solid, but there's an unguarded division and unclear naming.",
    "findings": [
        {
            "severity": "critical",
            "location": "line 4, function calculate_average",
            "problem": "Divides by len(items) without checking for an empty list.",
            "explanation": "Calling this with an empty list raises a ZeroDivisionError at runtime.",
            "suggestion": "Add a guard clause: return 0 (or raise a clear error) when items is empty.",
        },
        {
            "severity": "suggestion",
            "location": "variable `x`",
            "problem": "Non-descriptive variable name.",
            "explanation": "Makes the code harder to follow for future readers.",
            "suggestion": "Rename `x` to something like `total`.",
        },
    ],
    "strengths": ["Function is short and single-purpose."],
}


def test_review_endpoint_returns_structured_findings(client, fake_llm):
    fake_llm.next_response = json_response(VALID_REVIEW_LLM_OUTPUT)

    response = client.post(
        "/api/v1/review",
        json={
            "language": "python",
            "code": "def calculate_average(items):\n    x = sum(items)\n    return x / len(items)",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["findings"]) == 2
    assert body["findings"][0]["severity"] == "critical"
    assert body["strengths"] == ["Function is short and single-purpose."]


def test_review_endpoint_rejects_schema_mismatch(client, fake_llm):
    # Missing required fields on the findings entries.
    fake_llm.next_response = json_response({"summary": "ok", "findings": [{"severity": "critical"}]})

    response = client.post(
        "/api/v1/review", json={"language": "python", "code": "print('hello')"}
    )

    assert response.status_code == 502
