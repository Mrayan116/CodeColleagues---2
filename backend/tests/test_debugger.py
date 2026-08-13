from tests.conftest import json_response

VALID_DEBUG_LLM_OUTPUT = {
    "problem": "The loop never terminates because `i` is never incremented.",
    "why_it_happens": "In a while loop, the condition is re-checked every iteration; if the "
    "loop variable never changes, the condition stays true forever.",
    "hint": "Look at what changes — or doesn't — inside the loop body each pass.",
    "suggested_fix": "i = 0\nwhile i < 10:\n    print(i)\n    i += 1",
    "explanation": "Incrementing `i` each iteration makes the condition eventually false.",
    "concepts": ["loops", "infinite loop"],
    "complexity": {"time": "O(n)", "space": "O(1)"},
}


def test_debug_endpoint_returns_structured_result(client, fake_llm):
    fake_llm.next_response = json_response(VALID_DEBUG_LLM_OUTPUT)

    response = client.post(
        "/api/v1/debugger",
        json={
            "language": "python",
            "code": "i = 0\nwhile i < 10:\n    print(i)",
            "error_message": "Script hangs and never exits",
            "reveal_fix": True,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["problem"] == VALID_DEBUG_LLM_OUTPUT["problem"]
    assert body["suggested_fix"] is not None
    assert body["complexity"]["time"] == "O(n)"


def test_debug_endpoint_hides_fix_when_not_requested(client, fake_llm):
    fake_llm.next_response = json_response(VALID_DEBUG_LLM_OUTPUT)

    response = client.post(
        "/api/v1/debugger",
        json={"language": "python", "code": "i = 0\nwhile i < 10:\n    print(i)", "reveal_fix": False},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["suggested_fix"] is None
    assert body["explanation"] is None


def test_debug_endpoint_rejects_malformed_llm_output(client, fake_llm):
    fake_llm.next_response = "not valid json at all"

    response = client.post(
        "/api/v1/debugger",
        json={"language": "python", "code": "print('hi'", "reveal_fix": False},
    )

    assert response.status_code == 502


def test_list_supported_languages(client):
    response = client.get("/api/v1/debugger/languages")
    assert response.status_code == 200
    languages = response.json()["languages"]
    for expected in ["python", "java", "cpp", "c"]:
        assert expected in languages
