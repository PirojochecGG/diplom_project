from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AttackTechnique


DATA_DIR = Path(__file__).resolve().parents[2] / "data"
ATTACK_STIX_PATHS = [
    DATA_DIR / "enterprise-attack.json",
    DATA_DIR / "mobile-attack.json",
    DATA_DIR / "ics-attack.json",
]

FALLBACK_ATTACK_TECHNIQUES = [
    {
        "attack_id": "T1071.001",
        "tactic": "Command And Control",
        "technique_name": "Application Layer Protocol: Web Protocols",
        "reference_url": "https://attack.mitre.org/techniques/T1071/001/",
    },
    {
        "attack_id": "T1041",
        "tactic": "Exfiltration",
        "technique_name": "Exfiltration Over C2 Channel",
        "reference_url": "https://attack.mitre.org/techniques/T1041/",
    },
    {
        "attack_id": "T1566.001",
        "tactic": "Initial Access",
        "technique_name": "Phishing: Spearphishing Attachment",
        "reference_url": "https://attack.mitre.org/techniques/T1566/001/",
    },
    {
        "attack_id": "T1059.001",
        "tactic": "Execution",
        "technique_name": "Command And Scripting Interpreter: PowerShell",
        "reference_url": "https://attack.mitre.org/techniques/T1059/001/",
    },
    {
        "attack_id": "T1112",
        "tactic": "Defense Evasion",
        "technique_name": "Modify Registry",
        "reference_url": "https://attack.mitre.org/techniques/T1112/",
    },
    {
        "attack_id": "T1105",
        "tactic": "Command And Control",
        "technique_name": "Ingress Tool Transfer",
        "reference_url": "https://attack.mitre.org/techniques/T1105/",
    },
]


def _format_tactic(phase_name: str) -> str:
    return phase_name.replace("-", " ").title()


def _extract_attack_reference(obj: dict) -> dict | None:
    for reference in obj.get("external_references", []):
        if reference.get("source_name") == "mitre-attack" and reference.get("external_id"):
            return reference
    return None


def load_attack_techniques() -> list[dict[str, str]]:
    available_paths = [path for path in ATTACK_STIX_PATHS if path.exists()]
    if not available_paths:
        return FALLBACK_ATTACK_TECHNIQUES

    techniques_by_id: dict[str, dict[str, str]] = {}

    for path in available_paths:
        raw = json.loads(path.read_text())
        for obj in raw.get("objects", []):
            if obj.get("type") != "attack-pattern":
                continue
            if obj.get("x_mitre_deprecated") or obj.get("revoked"):
                continue

            attack_reference = _extract_attack_reference(obj)
            if attack_reference is None:
                continue

            attack_id = attack_reference["external_id"]
            phases = [
                _format_tactic(phase["phase_name"])
                for phase in obj.get("kill_chain_phases", [])
                if phase.get("kill_chain_name") == "mitre-attack" and phase.get("phase_name")
            ]
            tactic = ", ".join(dict.fromkeys(phases)) if phases else "Unknown"
            reference_url = attack_reference.get(
                "url",
                f"https://attack.mitre.org/techniques/{attack_id.replace('.', '/')}/",
            )

            existing = techniques_by_id.get(attack_id)
            if existing is None:
                techniques_by_id[attack_id] = {
                    "attack_id": attack_id,
                    "tactic": tactic,
                    "technique_name": obj["name"],
                    "reference_url": reference_url,
                }
                continue

            merged_tactics = [part.strip() for part in f"{existing['tactic']}, {tactic}".split(",") if part.strip()]
            existing["tactic"] = ", ".join(dict.fromkeys(merged_tactics))
            existing["reference_url"] = existing["reference_url"] or reference_url

    return sorted(techniques_by_id.values(), key=lambda item: item["attack_id"])


def seed_attack_techniques(db: Session) -> int:
    source_items = load_attack_techniques()
    existing = {
        item.attack_id: item
        for item in db.scalars(select(AttackTechnique)).all()
    }

    for item in source_items:
        current = existing.get(item["attack_id"])
        if current is None:
            db.add(AttackTechnique(**item))
            continue

        current.tactic = item["tactic"]
        current.technique_name = item["technique_name"]
        current.reference_url = item["reference_url"]

    db.commit()
    return len(source_items)
