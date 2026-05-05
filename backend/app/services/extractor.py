from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import urlparse

from app.models.entities import IocType


@dataclass
class ExtractedIoc:
    type: IocType
    value: str
    normalized_value: str
    confidence: float
    extracted_from: str


FILE_LIKE_DOMAIN_SUFFIXES = {
    "ap15",
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
    "pkg",
}

NON_DOMAIN_SUFFIXES = {
    "all",
    "read",
    "write",
    "access",
}


DOMAIN_RE = re.compile(r"\b(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}\b")


PATTERNS: list[tuple[IocType, re.Pattern[str], float]] = [
    (IocType.URL, re.compile(r"\bhttps?://[^\s`\"'<>]+", re.IGNORECASE), 0.9),
    (IocType.IPV4, re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"), 0.95),
    (IocType.IPV6, re.compile(r"\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b"), 0.95),
    (IocType.HASH_SHA256, re.compile(r"\b[a-fA-F0-9]{64}\b"), 0.98),
    (IocType.HASH_SHA1, re.compile(r"\b[a-fA-F0-9]{40}\b"), 0.98),
    (IocType.HASH_MD5, re.compile(r"\b[a-fA-F0-9]{32}\b"), 0.98),
    (IocType.REGISTRY_KEY, re.compile(r"\b(?:HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER)\\[^\s,;]+"), 0.7),
    (
        IocType.FILE_PATH,
        re.compile(r"\b[A-Za-z]:\\(?:[^\\/:*?\"<>|`\r\n]+\\)*[^\\/:*?\"<>|`\r\n]*\.[A-Za-z0-9]{1,10}"),
        0.75,
    ),
    (IocType.DOMAIN, DOMAIN_RE, 0.8),
    (IocType.MUTEX, re.compile(r"\b(?:Global|Local)\\[A-Za-z0-9_.-]{3,}\b"), 0.55),
    (IocType.HOST_ARTIFACT, re.compile(r"\b[A-Z][A-Z0-9]+(?:-[A-Z0-9]+){2,}\b"), 0.6),
    (IocType.USER_AGENT, re.compile(r"User-Agent:\s*([^\n\r]+)", re.IGNORECASE), 0.6),
    (IocType.USER_AGENT, re.compile(r"user-agent\s+`?([^\s`\n\r]+)`?", re.IGNORECASE), 0.6),
    (
        IocType.USER_AGENT,
        re.compile(r"User browser string\s+`?([^\n\r`]+)`?", re.IGNORECASE),
        0.6,
    ),
]


def refang_text(text: str) -> str:
    return (
        text.replace("hxxps://", "https://")
        .replace("hxxp://", "http://")
        .replace("HXXPS://", "https://")
        .replace("HXXP://", "http://")
        .replace("[.]", ".")
    )


def normalize_value(ioc_type: IocType, value: str) -> str:
    normalized = refang_text(value).strip().strip("`\"'")
    normalized = normalized.rstrip(".,;)")
    if ioc_type == IocType.DOMAIN:
        return normalized.lower()
    if ioc_type == IocType.URL:
        return normalized.rstrip("/")
    return normalized


def is_false_positive_domain(value: str) -> bool:
    suffix = value.rsplit(".", maxsplit=1)[-1].lower()
    return suffix in FILE_LIKE_DOMAIN_SUFFIXES or suffix in NON_DOMAIN_SUFFIXES


def is_match_inside_url(match: re.Match[str], url_spans: list[tuple[int, int]]) -> bool:
    start, end = match.span()
    return any(url_start <= start and end <= url_end for url_start, url_end in url_spans)


def is_email_fragment(text: str, match: re.Match[str]) -> bool:
    start, end = match.span()
    return (start > 0 and text[start - 1] == "@") or (end < len(text) and text[end] == "@")


def domain_from_url(value: str) -> str | None:
    hostname = urlparse(value).hostname
    if hostname is None:
        return None

    normalized = normalize_value(IocType.DOMAIN, hostname)
    if not DOMAIN_RE.fullmatch(normalized) or is_false_positive_domain(normalized):
        return None

    return normalized


def extract_iocs(text: str) -> list[ExtractedIoc]:
    normalized_text = refang_text(text)
    url_pattern = next(pattern for ioc_type, pattern, _ in PATTERNS if ioc_type == IocType.URL)
    url_spans = [match.span() for match in url_pattern.finditer(normalized_text)]
    candidates: dict[tuple[IocType, str], ExtractedIoc] = {}
    for ioc_type, pattern, confidence in PATTERNS:
        for match in pattern.finditer(normalized_text):
            if ioc_type == IocType.DOMAIN and (
                is_match_inside_url(match, url_spans) or is_email_fragment(normalized_text, match)
            ):
                continue
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
            if ioc_type == IocType.URL:
                domain = domain_from_url(normalized)
                if domain is not None and (IocType.DOMAIN, domain) not in candidates:
                    candidates[(IocType.DOMAIN, domain)] = ExtractedIoc(
                        type=IocType.DOMAIN,
                        value=domain,
                        normalized_value=domain,
                        confidence=0.8,
                        extracted_from=match.group(0).strip(),
                    )

    for candidate in list(candidates.values()):
        if candidate.type == IocType.DOMAIN:
            if is_false_positive_domain(candidate.normalized_value):
                candidates.pop((candidate.type, candidate.normalized_value), None)
                continue
    return sorted(candidates.values(), key=lambda item: (item.type.value, item.normalized_value))
