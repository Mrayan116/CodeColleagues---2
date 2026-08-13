from tests.conftest import json_response

VALID_TUTOR_LLM_OUTPUT = {
    "reply": "A stack is LIFO — last in, first out.",
    "concepts": ["stacks"],
    "follow_up_suggestions": [],
}


def test_history_lists_sessions_after_chatting(client, fake_llm):
    fake_llm.next_response = json_response(VALID_TUTOR_LLM_OUTPUT)

    chat_response = client.post(
        "/api/v1/tutor",
        json={"message": "What is a stack?", "skill_level": "beginner", "history": []},
    )
    session_id = chat_response.json()["session_id"]

    list_response = client.get("/api/v1/tutor/sessions")
    assert list_response.status_code == 200
    sessions = list_response.json()
    assert any(s["id"] == session_id for s in sessions)
    matching = next(s for s in sessions if s["id"] == session_id)
    assert matching["message_count"] == 2  # user + assistant


def test_history_returns_session_transcript(client, fake_llm):
    fake_llm.next_response = json_response(VALID_TUTOR_LLM_OUTPUT)

    chat_response = client.post(
        "/api/v1/tutor",
        json={"message": "What is a stack?", "skill_level": "beginner", "history": []},
    )
    session_id = chat_response.json()["session_id"]

    detail_response = client.get(f"/api/v1/tutor/sessions/{session_id}")
    assert detail_response.status_code == 200
    body = detail_response.json()
    assert len(body["messages"]) == 2
    assert body["messages"][0]["role"] == "user"
    assert body["messages"][1]["role"] == "assistant"


def test_history_404s_for_unknown_session(client):
    response = client.get("/api/v1/tutor/sessions/does-not-exist")
    assert response.status_code == 404
