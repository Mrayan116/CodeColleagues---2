from tests.conftest import json_response

VALID_PRACTICE_LLM_OUTPUT = {
    "questions": [
        {
            "title": "Reverse a Linked List",
            "problem_statement": "Given the head of a singly linked list, reverse it in place.",
            "example_input": "1 -> 2 -> 3 -> None",
            "example_output": "3 -> 2 -> 1 -> None",
            "constraints": ["0 <= length <= 5000"],
            "hints": [
                "Think about what pointers you need to track as you walk the list.",
                "You'll need to remember the previous node before moving forward.",
            ],
            "solution": "Iterate with prev/current pointers, reversing each `next` link.",
        },
        {
            "title": "Detect a Cycle",
            "problem_statement": "Given a linked list, determine if it has a cycle.",
            "example_input": "1 -> 2 -> 3 -> 2 (cycle)",
            "example_output": "true",
            "constraints": [],
            "hints": ["Consider using two pointers moving at different speeds.", "This is Floyd's algorithm."],
            "solution": "Use fast/slow pointers; if they meet, there's a cycle.",
        },
    ]
}


def test_practice_generates_requested_count(client, fake_llm):
    fake_llm.next_response = json_response(VALID_PRACTICE_LLM_OUTPUT)

    response = client.post(
        "/api/v1/practice",
        json={"language": "python", "topic": "Linked Lists", "difficulty": "medium", "count": 2},
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["questions"]) == 2
    assert body["questions"][0]["title"] == "Reverse a Linked List"
    assert len(body["questions"][0]["hints"]) == 2


def test_practice_rejects_count_out_of_range(client, fake_llm):
    fake_llm.next_response = json_response(VALID_PRACTICE_LLM_OUTPUT)

    response = client.post(
        "/api/v1/practice",
        json={"language": "python", "topic": "Recursion", "difficulty": "easy", "count": 10},
    )

    assert response.status_code == 422
