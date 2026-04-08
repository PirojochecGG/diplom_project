from __future__ import annotations

import re
from dataclasses import dataclass

from app.models.entities import IocType


@dataclass
class ExtractedIoc:
    type: IocType
    value: str
    normalized_value: str
    confidence: float
    extracted_from: str


FILE_LIKE_DOMAIN_SUFFIXES = {
    "exe",
    "dll",
    "bat",
    "cmd",
    "ps1",
    "vbs",
    "js",
    "zip",
    "rar",
    "7z",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
}


PATTERNS: list[tuple[IocType, re.Pattern[str], float]] = [
    (IocType.URL, re.compile(r"\bhttps?://[^\s\"'<>]+", re.IGNORECASE), 0.9),
    (IocType.IPV4, re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"), 0.95),
    (IocType.IPV6, re.compile(r"\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b"), 0.95),
    (IocType.HASH_SHA256, re.compile(r"\b[a-fA-F0-9]{64}\b"), 0.98),
    (IocType.HASH_SHA1, re.compile(r"\b[a-fA-F0-9]{40}\b"), 0.98),
    (IocType.HASH_MD5, re.compile(r"\b[a-fA-F0-9]{32}\b"), 0.98),
    (IocType.REGISTRY_KEY, re.compile(r"\b(?:HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER)\\[^\s,;]+"), 0.7),
    (IocType.FILE_PATH, re.compile(r"\b[A-Za-z]:\\(?:[^\s\\/:*?\"<>|\r\n]+\\)*[^\s\\/:*?\"<>|\r\n]+"), 0.65),
    (IocType.DOMAIN, re.compile(r"\b(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}\b"), 0.8),
    (IocType.MUTEX, re.compile(r"\b(?:Global|Local)\\[A-Za-z0-9_.-]{3,}\b"), 0.55),
    (IocType.USER_AGENT, re.compile(r"User-Agent:\s*([^\n\r]+)", re.IGNORECASE), 0.6),
]


def normalize_value(ioc_type: IocType, value: str) -> str:
    normalized = value.strip().strip(".,;)")
    if ioc_type == IocType.DOMAIN:
        return normalized.lower()
    if ioc_type == IocType.URL:
        return normalized.rstrip("/")
    return normalized


def is_false_positive_domain(value: str) -> bool:
    suffix = value.rsplit(".", maxsplit=1)[-1].lower()
    return suffix in FILE_LIKE_DOMAIN_SUFFIXES


def extract_iocs(text: str) -> list[ExtractedIoc]:
    candidates: dict[tuple[IocType, str], ExtractedIoc] = {}
    for ioc_type, pattern, confidence in PATTERNS:
        for match in pattern.finditer(text):
            raw_value = match.group(1).strip() if ioc_type == IocType.USER_AGENT and match.groups() else match.group(0).strip()
            normalized = normalize_value(ioc_type, raw_value)
            key = (ioc_type, normalized)
            if key not in candidates:
                candidates[key] = ExtractedIoc(
                    type=ioc_type,
                    value=raw_value,
                    normalized_value=normalized,
                    confidence=confidence,
                    extracted_from=match.group(0).strip(),
                )

    for candidate in list(candidates.values()):
        if candidate.type == IocType.DOMAIN:
            if is_false_positive_domain(candidate.normalized_value):
                candidates.pop((candidate.type, candidate.normalized_value), None)
                continue
            if any(
                other.type == IocType.URL and candidate.normalized_value in other.normalized_value
                for other in candidates.values()
            ):
                candidates.pop((candidate.type, candidate.normalized_value), None)
    return sorted(candidates.values(), key=lambda item: (item.type.value, item.normalized_value))
