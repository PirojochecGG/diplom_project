from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class IocType(str, Enum):
    IPV4 = "ipv4"
    IPV6 = "ipv6"
    DOMAIN = "domain"
    URL = "url"
    HASH_MD5 = "hash_md5"
    HASH_SHA1 = "hash_sha1"
    HASH_SHA256 = "hash_sha256"
    FILE_PATH = "file_path"
    REGISTRY_KEY = "registry_key"
    MUTEX = "mutex"
    USER_AGENT = "user_agent"
    HOST_ARTIFACT = "host_artifact"
    NETWORK_ARTIFACT = "network_artifact"


class IocStatus(str, Enum):
    CANDIDATE = "candidate"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"


ioc_attack_technique = Table(
    "ioc_attack_technique",
    Base.metadata,
    Column("ioc_id", ForeignKey("iocs.id"), primary_key=True),
    Column("attack_technique_id", ForeignKey("attack_techniques.id"), primary_key=True),
)


feed_ioc = Table(
    "feed_ioc",
    Base.metadata,
    Column("feed_id", ForeignKey("feeds.id"), primary_key=True),
    Column("ioc_id", ForeignKey("iocs.id"), primary_key=True),
)


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    iocs: Mapped[list[Ioc]] = relationship(back_populates="incident", cascade="all, delete-orphan")


class Ioc(Base):
    __tablename__ = "iocs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), index=True)
    type: Mapped[IocType] = mapped_column(SqlEnum(IocType))
    value: Mapped[str] = mapped_column(String(2048))
    normalized_value: Mapped[str] = mapped_column(String(2048), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    status: Mapped[IocStatus] = mapped_column(SqlEnum(IocStatus), default=IocStatus.CANDIDATE)
    extracted_from: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    incident: Mapped[Incident] = relationship(back_populates="iocs")
    attributes: Mapped[list[IocAttribute]] = relationship(back_populates="ioc", cascade="all, delete-orphan")
    attack_techniques: Mapped[list[AttackTechnique]] = relationship(
        secondary=ioc_attack_technique,
        back_populates="iocs",
    )
    feeds: Mapped[list[Feed]] = relationship(secondary=feed_ioc, back_populates="iocs")


class IocAttribute(Base):
    __tablename__ = "ioc_attributes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ioc_id: Mapped[int] = mapped_column(ForeignKey("iocs.id"), index=True)
    key: Mapped[str] = mapped_column(String(128))
    value: Mapped[str] = mapped_column(String(2048))

    ioc: Mapped[Ioc] = relationship(back_populates="attributes")


class AttackTechnique(Base):
    __tablename__ = "attack_techniques"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attack_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    tactic: Mapped[str] = mapped_column(String(128))
    technique_name: Mapped[str] = mapped_column(String(255))
    reference_url: Mapped[str] = mapped_column(String(1024))

    iocs: Mapped[list[Ioc]] = relationship(
        secondary=ioc_attack_technique,
        back_populates="attack_techniques",
    )


class Feed(Base):
    __tablename__ = "feeds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    iocs: Mapped[list[Ioc]] = relationship(secondary=feed_ioc, back_populates="feeds")
