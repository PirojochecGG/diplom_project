import os
from pathlib import Path

import httpx
import pytest
from sqlalchemy import select


TEST_DB = Path(__file__).resolve().parents[1] / "data" / "test_cti.db"
os.environ["CTI_TEST_DB"] = str(TEST_DB)
if TEST_DB.exists():
    TEST_DB.unlink()

from app.main import app  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.models import AttackTechnique, Base  # noqa: E402
from app.services.seeds import ATTACK_TECHNIQUES  # noqa: E402


def initialize_db() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        existing = db.scalar(select(AttackTechnique.id))
        if existing is None:
            for item in ATTACK_TECHNIQUES:
                db.add(AttackTechnique(**item))
            db.commit()


@pytest.mark.anyio
async def test_full_api_flow() -> None:
    initialize_db()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/incidents",
            json={
                "title": "Suspicious loader",
                "description": (
                    "The host reached https://evil.example.com/payload from 10.10.10.5 and created "
                    "HKCU\\Software\\BadStuff\\Run with SHA256 "
                    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                ),
                "source": "SOC analyst",
            },
        )
        assert response.status_code == 201
        incident = response.json()

        extracted = await client.post(f"/api/incidents/{incident['id']}/extract")
        assert extracted.status_code == 200
        iocs = extracted.json()
        assert len(iocs) >= 3

        techniques = await client.get("/api/attack-techniques")
        assert techniques.status_code == 200
        technique_id = techniques.json()[0]["id"]

        first_ioc_id = iocs[0]["id"]
        updated = await client.patch(
            f"/api/iocs/{first_ioc_id}",
            json={
                "status": "confirmed",
                "description": "Reviewed by analyst",
                "attack_technique_ids": [technique_id],
                "attributes": {"source": "auto"},
            },
        )
        assert updated.status_code == 200

        feed = await client.post(
            "/api/feeds",
            json={
                "name": "Incident feed",
                "incident_id": incident["id"],
                "ioc_ids": [first_ioc_id],
            },
        )
        assert feed.status_code == 201
        feed_id = feed.json()["id"]

        export = await client.get(f"/api/feeds/{feed_id}/export/stix")
        assert export.status_code == 200
        bundle = export.json()["bundle"]
        assert bundle["type"] == "bundle"
        assert any(item["type"] == "indicator" for item in bundle["objects"])
