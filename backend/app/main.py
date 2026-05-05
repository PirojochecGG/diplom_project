from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api.routes import router
from app.db.session import SessionLocal, engine
from app.models import Base
from app.services.seeds import seed_attack_techniques


app = FastAPI(title="CTI IoC Feed Prototype", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def ensure_feed_stix_columns() -> None:
    inspector = inspect(engine)
    if "feeds" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("feeds")}
    statements: list[str] = []
    if "stix_bundle_path" not in existing_columns:
        statements.append("ALTER TABLE feeds ADD COLUMN stix_bundle_path VARCHAR(1024)")
    if "stix_exported_at" not in existing_columns:
        statements.append("ALTER TABLE feeds ADD COLUMN stix_exported_at DATETIME")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_feed_stix_columns()
    with SessionLocal() as db:
        seed_attack_techniques(db)
