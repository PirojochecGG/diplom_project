from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db
from app.core.config import DATA_DIR
from app.models.entities import AttackTechnique, Feed, Incident, Ioc, IocAttribute, IocStatus
from app.schemas.api import (
    AttackTechniqueRead,
    FeedCreate,
    FeedRead,
    IncidentCreate,
    IncidentRead,
    IocRead,
    IocUpdate,
    StixBundleResponse,
)
from app.services.extractor import extract_iocs
from app.services.stix import build_stix_bundle


router = APIRouter(prefix="/api")


def build_export_filename(feed: Feed) -> Path:
    safe_name = re.sub(r"[^a-zA-Z0-9_-]+", "-", feed.name.strip().lower()).strip("-") or f"feed-{feed.id}"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return DATA_DIR / f"{safe_name}-{timestamp}.json"


def incident_query():
    return select(Incident).options(
        selectinload(Incident.iocs)
        .selectinload(Ioc.attributes),
        selectinload(Incident.iocs)
        .selectinload(Ioc.attack_techniques),
    )


def get_incident_or_404(db: Session, incident_id: int) -> Incident:
    incident = db.scalar(incident_query().where(Incident.id == incident_id))
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


def get_ioc_or_404(db: Session, ioc_id: int) -> Ioc:
    statement = (
        select(Ioc)
        .options(selectinload(Ioc.attributes), selectinload(Ioc.attack_techniques))
        .where(Ioc.id == ioc_id)
    )
    ioc = db.scalar(statement)
    if ioc is None:
        raise HTTPException(status_code=404, detail="IoC not found")
    return ioc


def get_feed_or_404(db: Session, feed_id: int) -> Feed:
    statement = (
        select(Feed)
        .options(
            selectinload(Feed.iocs).selectinload(Ioc.attributes),
            selectinload(Feed.iocs).selectinload(Ioc.attack_techniques),
        )
        .where(Feed.id == feed_id)
    )
    feed = db.scalar(statement)
    if feed is None:
        raise HTTPException(status_code=404, detail="Feed not found")
    return feed


@router.post("/incidents", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)) -> Incident:
    incident = Incident(title=payload.title, description=payload.description, source=payload.source)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return get_incident_or_404(db, incident.id)


@router.get("/incidents", response_model=list[IncidentRead])
async def list_incidents(db: Session = Depends(get_db)) -> list[Incident]:
    return list(db.scalars(incident_query().order_by(Incident.created_at.desc())).all())


@router.get("/incidents/{incident_id}", response_model=IncidentRead)
async def get_incident(incident_id: int, db: Session = Depends(get_db)) -> Incident:
    return get_incident_or_404(db, incident_id)


@router.post("/incidents/{incident_id}/extract", response_model=list[IocRead])
async def extract_incident_iocs(incident_id: int, db: Session = Depends(get_db)) -> list[Ioc]:
    incident = get_incident_or_404(db, incident_id)
    extracted = extract_iocs(incident.description)

    for ioc in list(incident.iocs):
        db.delete(ioc)
    db.flush()

    for candidate in extracted:
        db.add(
            Ioc(
                incident_id=incident.id,
                type=candidate.type,
                value=candidate.value,
                normalized_value=candidate.normalized_value,
                confidence=candidate.confidence,
                extracted_from=candidate.extracted_from,
                status=IocStatus.CANDIDATE,
            )
        )

    db.commit()
    db.expire_all()
    refreshed = get_incident_or_404(db, incident_id)
    return refreshed.iocs


@router.patch("/iocs/{ioc_id}", response_model=IocRead)
async def update_ioc(ioc_id: int, payload: IocUpdate, db: Session = Depends(get_db)) -> Ioc:
    ioc = get_ioc_or_404(db, ioc_id)
    if payload.description is not None:
        ioc.description = payload.description
    if payload.confidence is not None:
        ioc.confidence = payload.confidence
    if payload.status is not None:
        ioc.status = payload.status
    if payload.attributes is not None:
        ioc.attributes.clear()
        for key, value in payload.attributes.items():
            ioc.attributes.append(IocAttribute(key=key, value=value))
    if payload.attack_technique_ids is not None:
        techniques = list(
            db.scalars(
                select(AttackTechnique).where(AttackTechnique.id.in_(payload.attack_technique_ids))
            ).all()
        )
        ioc.attack_techniques = techniques
    db.commit()
    db.refresh(ioc)
    return get_ioc_or_404(db, ioc_id)


@router.get("/attack-techniques", response_model=list[AttackTechniqueRead])
async def list_attack_techniques(db: Session = Depends(get_db)) -> list[AttackTechnique]:
    return list(db.scalars(select(AttackTechnique).order_by(AttackTechnique.attack_id)).all())


@router.post("/feeds", response_model=FeedRead, status_code=status.HTTP_201_CREATED)
async def create_feed(payload: FeedCreate, db: Session = Depends(get_db)) -> Feed:
    incident = get_incident_or_404(db, payload.incident_id)
    ioc_ids = payload.ioc_ids or [ioc.id for ioc in incident.iocs if ioc.status == IocStatus.CONFIRMED]
    if not ioc_ids:
        raise HTTPException(status_code=400, detail="No confirmed IoCs selected for feed")

    iocs = list(
        db.scalars(
            select(Ioc)
            .options(selectinload(Ioc.attributes), selectinload(Ioc.attack_techniques))
            .where(Ioc.id.in_(ioc_ids), Ioc.incident_id == incident.id, Ioc.status == IocStatus.CONFIRMED)
        ).all()
    )
    if not iocs:
        raise HTTPException(status_code=400, detail="Selected IoCs are invalid or not confirmed")

    feed = Feed(name=payload.name, incident_id=incident.id, iocs=iocs)
    db.add(feed)
    db.commit()
    db.refresh(feed)
    return get_feed_or_404(db, feed.id)


@router.get("/feeds", response_model=list[FeedRead])
async def list_feeds(db: Session = Depends(get_db)) -> list[Feed]:
    statement = (
        select(Feed)
        .options(
            selectinload(Feed.iocs).selectinload(Ioc.attributes),
            selectinload(Feed.iocs).selectinload(Ioc.attack_techniques),
        )
        .order_by(Feed.created_at.desc())
    )
    return list(db.scalars(statement).all())


@router.get("/feeds/{feed_id}", response_model=FeedRead)
async def get_feed(feed_id: int, db: Session = Depends(get_db)) -> Feed:
    return get_feed_or_404(db, feed_id)


@router.get("/feeds/{feed_id}/export/stix", response_model=StixBundleResponse)
async def export_feed_stix(feed_id: int, db: Session = Depends(get_db)) -> StixBundleResponse:
    feed = get_feed_or_404(db, feed_id)
    bundle = build_stix_bundle(feed)
    output_path = build_export_filename(feed)
    output_path.write_text(json.dumps(bundle, indent=2), encoding="utf-8")
    feed.stix_bundle_path = str(output_path)
    feed.stix_exported_at = datetime.now(timezone.utc)
    db.commit()
    return StixBundleResponse(bundle=bundle, saved_path=str(output_path))


@router.get("/feeds/{feed_id}/stix", response_model=StixBundleResponse)
async def get_feed_stix(feed_id: int, db: Session = Depends(get_db)) -> StixBundleResponse:
    feed = get_feed_or_404(db, feed_id)
    if not feed.stix_bundle_path:
        raise HTTPException(status_code=404, detail="STIX bundle has not been exported for this feed yet")

    bundle_path = Path(feed.stix_bundle_path)
    if not bundle_path.exists():
        raise HTTPException(status_code=404, detail="Saved STIX bundle file was not found")

    try:
        bundle = json.loads(bundle_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail="Saved STIX bundle file is not valid JSON") from exc

    return StixBundleResponse(bundle=bundle, saved_path=str(bundle_path))
