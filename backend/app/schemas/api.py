from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import IocStatus, IocType


class AttackTechniqueRead(BaseModel):
    id: int
    attack_id: str
    tactic: str
    technique_name: str
    reference_url: str

    model_config = ConfigDict(from_attributes=True)


class IocAttributeRead(BaseModel):
    id: int
    key: str
    value: str

    model_config = ConfigDict(from_attributes=True)


class IocRead(BaseModel):
    id: int
    incident_id: int
    type: IocType
    value: str
    normalized_value: str
    description: str | None
    confidence: float
    status: IocStatus
    extracted_from: str | None
    created_at: datetime
    updated_at: datetime
    attributes: list[IocAttributeRead]
    attack_techniques: list[AttackTechniqueRead]

    model_config = ConfigDict(from_attributes=True)


class IncidentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    source: str | None = Field(default=None, max_length=255)


class IncidentRead(BaseModel):
    id: int
    title: str
    description: str
    source: str | None
    created_at: datetime
    updated_at: datetime
    iocs: list[IocRead] = []

    model_config = ConfigDict(from_attributes=True)


class IocUpdate(BaseModel):
    description: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    status: IocStatus | None = None
    attributes: dict[str, str] | None = None
    attack_technique_ids: list[int] | None = None


class FeedCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    incident_id: int
    ioc_ids: list[int] = Field(default_factory=list)


class FeedRead(BaseModel):
    id: int
    name: str
    incident_id: int
    created_at: datetime
    iocs: list[IocRead]

    model_config = ConfigDict(from_attributes=True)


class StixBundleResponse(BaseModel):
    bundle: dict[str, Any]
    saved_path: str
