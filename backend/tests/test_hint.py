from tests.conftest import json_response

VALID_HINT_LLM_OUTPUT = {
    "hint_1": "Think about what changes each time your loop body runs.",
    "hint_2": "Compare the loop variable's value right before and after the condition check.",
    "hint_3": "The condition compares against the wrong variable — check which one you increment.",
    "solution": "Increment `i`, not `count`, inside the loop.",
    "concepts": ["loops", "off-by-one"],
}


def test_hint_endpoint_hides_solution_by_default(client, fake_llm):
    fake_llm.next_response = json_response(VALID_HINT_LLM_OUTPUT)

    response = client.post(
        "/api/v1/hint",
        json={"problem": "My loop never ends", "skill_level": "beginner", "reveal_solution": False},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["hint_1"] == VALID_HINT_LLM_OUTPUT["hint_1"]
    assert body["solution"] is None


def test_hint_endpoint_reveals_solution_when_requested(client, fake_llm):
    fake_llm.next_response = json_response(VALID_HINT_LLM_OUTPUT)

    response = client.post(
        "/api/v1/hint",
        json={"problem": "My loop never ends", "skill_level": "beginner", "reveal_solution": True},
    )

    assert response.status_code == 200
    assert response.json()["solution"] == VALID_HINT_LLM_OUTPUT["solution"]


def test_hint_endpoint_rejects_malformed_output(client, fake_llm):
    fake_llm.next_response = "definitely not json"

    response = client.post("/api/v1/hint", json={"problem": "stuck", "reveal_solution": False})

    assert response.status_code == 502
