import json

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.services.llm.base import LLMProvider
from app.services.llm.factory import get_llm_provider


class FakeLLMProvider(LLMProvider):
    """A deterministic stand-in for a real provider. Tests set `next_response`
    to whatever JSON string the code path under test should receive, so no
    network calls (and no API credits) are involved.
    """

    def __init__(self) -> None:
        self.next_response: str = "{}"

    async def complete(self, *, system_prompt, user_prompt, temperature=None, max_tokens=None, json_mode=False):
        return self.next_response

    async def chat(self, *, system_prompt, messages, temperature=None, max_tokens=None):
        return self.next_response


@pytest.fixture()
def fake_llm() -> FakeLLMProvider:
    return FakeLLMProvider()


@pytest.fixture()
def client(fake_llm: FakeLLMProvider) -> TestClient:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_llm_provider] = lambda: fake_llm

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def json_response(payload: dict) -> str:
    return json.dumps(payload)
