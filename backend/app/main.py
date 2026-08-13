from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import debugger, explain, health, hint, practice, review, tutor
from app.core.config import get_settings
from app.core.database import Base, engine

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI programming tutor, debugger, and code reviewer for students.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(tutor.router, prefix=settings.API_V1_PREFIX)
app.include_router(debugger.router, prefix=settings.API_V1_PREFIX)
app.include_router(review.router, prefix=settings.API_V1_PREFIX)
app.include_router(hint.router, prefix=settings.API_V1_PREFIX)
app.include_router(explain.router, prefix=settings.API_V1_PREFIX)
app.include_router(practice.router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def on_startup() -> None:
    # Phase 1: create tables directly for a fast local start. Once the schema
    # stabilizes, switch to `alembic upgrade head` (see alembic/ directory)
    # and drop this call.
    #
    # Wrapped defensively: in tests (and any environment without a live DB)
    # routes get their session from an overridden get_db dependency, so a
    # failure here shouldn't block the app from serving requests.
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:  # noqa: BLE001
        print(f"[startup] Skipping table auto-create — DB not reachable yet: {exc}")


@app.get("/")
def root() -> dict:
    return {"message": f"{settings.APP_NAME} API — see /docs for the interactive API explorer."}
