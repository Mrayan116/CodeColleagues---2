from tests.conftest import json_response

VALID_TUTOR_LLM_OUTPUT = {
    "reply": "Recursion is when a function calls itself to solve a smaller version of the "
    "same problem, until it reaches a base case that stops the calls.",
    "concepts": ["recursion", "base case"],
    "follow_up_suggestions": ["Can you show me a recursive factorial example?"],
}


def test_tutor_chat_returns_reply(client, fake_llm):
    fake_llm.next_response = json_response(VALID_TUTOR_LLM_OUTPUT)

    response = client.post(
        "/api/v1/tutor",
        json={"message": "Can you explain recursion?", "skill_level": "beginner", "history": []},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == VALID_TUTOR_LLM_OUTPUT["reply"]
    assert "recursion" in body["concepts"]
    assert body["session_id"]  # a session id was generated


def test_tutor_chat_reuses_provided_session_id(client, fake_llm):
    fake_llm.next_response = json_response(VALID_TUTOR_LLM_OUTPUT)

    response = client.post(
        "/api/v1/tutor",
        json={
            "session_id": "11111111-1111-1111-1111-111111111111",
            "message": "Follow-up question",
            "skill_level": "intermediate",
            "history": [{"role": "user", "content": "Can you explain recursion?"}],
        },
    )

    assert response.status_code == 200
    assert response.json()["session_id"] == "11111111-1111-1111-1111-111111111111"


def test_tutor_chat_handles_llm_failure(client, fake_llm):
    fake_llm.next_response = "{invalid json"

    response = client.post(
        "/api/v1/tutor", json={"message": "hello", "skill_level": "beginner", "history": []}
    )

    assert response.status_code == 502
