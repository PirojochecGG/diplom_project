from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.models.entities import Feed, Ioc, IocType


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def stix_id(prefix: str) -> str:
    return f"{prefix}--{uuid4()}"


def indicator_pattern(ioc: Ioc) -> str:
    value = ioc.normalized_value.replace("'", "\\'")
    if ioc.type == IocType.IPV4:
        return f"[ipv4-addr:value = '{value}']"
    if ioc.type == IocType.IPV6:
        return f"[ipv6-addr:value = '{value}']"
    if ioc.type == IocType.DOMAIN:
        return f"[domain-name:value = '{value}']"
    if ioc.type == IocType.URL:
        return f"[url:value = '{value}']"
    if ioc.type == IocType.HASH_MD5:
        return f"[file:hashes.MD5 = '{value}']"
    if ioc.type == IocType.HASH_SHA1:
        return f"[file:hashes.'SHA-1' = '{value}']"
    if ioc.type == IocType.HASH_SHA256:
        return f"[file:hashes.'SHA-256' = '{value}']"
    if ioc.type == IocType.FILE_PATH:
        return f"[file:name = '{value.split('\\\\')[-1]}']"
    if ioc.type == IocType.REGISTRY_KEY:
        return f"[windows-registry-key:key = '{value}']"
    if ioc.type == IocType.USER_AGENT:
        return f"[network-traffic:extensions.'http-request-ext'.request_header.'User-Agent' = '{value}']"
    return f"[artifact:payload_bin = '{value}']"


def build_stix_bundle(feed: Feed) -> dict:
    now = utc_timestamp()
    objects: list[dict] = []
    attack_pattern_ids: dict[int, str] = {}

    report_id = stix_id("report")
    objects.append(
        {
            "type": "report",
            "spec_version": "2.1",
            "id": report_id,
            "created": now,
            "modified": now,
            "name": feed.name,
            "report_types": ["threat-report"],
            "published": now,
            "object_refs": [],
            "description": f"Feed generated from incident {feed.incident_id}",
        }
    )

    for ioc in feed.iocs:
        indicator_id = stix_id("indicator")
        indicator = {
            "type": "indicator",
            "spec_version": "2.1",
            "id": indicator_id,
            "created": now,
            "modified": now,
            "name": f"{ioc.type.value}: {ioc.normalized_value}",
            "description": ioc.description or f"IOC extracted from incident {ioc.incident_id}",
            "indicator_types": ["malicious-activity"],
            "pattern": indicator_pattern(ioc),
            "pattern_type": "stix",
            "valid_from": now,
            "confidence": int(ioc.confidence * 100),
        }
        objects.append(indicator)
        objects[0]["object_refs"].append(indicator_id)

        for technique in ioc.attack_techniques:
            attack_pattern_id = attack_pattern_ids.get(technique.id)
            if attack_pattern_id is None:
                attack_pattern_id = stix_id("attack-pattern")
                attack_pattern_ids[technique.id] = attack_pattern_id
                objects.append(
                    {
                        "type": "attack-pattern",
                        "spec_version": "2.1",
                        "id": attack_pattern_id,
                        "created": now,
                        "modified": now,
                        "name": technique.technique_name,
                        "external_references": [
                            {
                                "source_name": "mitre-attack",
                                "external_id": technique.attack_id,
                                "url": technique.reference_url,
                            }
                        ],
                        "x_mitre_tactic": technique.tactic,
                    }
                )
                objects[0]["object_refs"].append(attack_pattern_id)

            objects.append(
                {
                    "type": "relationship",
                    "spec_version": "2.1",
                    "id": stix_id("relationship"),
                    "created": now,
                    "modified": now,
                    "relationship_type": "indicates",
                    "source_ref": indicator_id,
                    "target_ref": attack_pattern_id,
                }
            )

    return {
        "type": "bundle",
        "id": stix_id("bundle"),
        "objects": objects,
    }
