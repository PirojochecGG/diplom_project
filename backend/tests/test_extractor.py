from app.services.extractor import extract_iocs


def test_extract_iocs_deduplicates_and_classifies() -> None:
    text = """
    Analyst observed hxxp replaced by https://evil.example.com/login and 8.8.8.8 twice: 8.8.8.8.
    SHA256: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    Registry HKCU\\Software\\BadStuff\\Run
    User-Agent: EvilBot/1.0
    """
    items = extract_iocs(text)
    values = {(item.type.value, item.normalized_value) for item in items}
    assert ("url", "https://evil.example.com/login") in values
    assert ("ipv4", "8.8.8.8") in values
    assert ("hash_sha256", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") in values
    assert ("registry_key", "HKCU\\Software\\BadStuff\\Run") in values
    assert ("user_agent", "EvilBot/1.0") in values
    assert len([item for item in items if item.normalized_value == "8.8.8.8"]) == 1


def test_extract_iocs_avoids_file_name_as_domain_and_trims_path() -> None:
    text = """
    On the host, analysts found file C:\\Users\\Public\\svchost32.exe and persistence via registry key
    HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SyncService.
    """
    items = extract_iocs(text)
    values = {(item.type.value, item.normalized_value) for item in items}
    assert ("file_path", "C:\\Users\\Public\\svchost32.exe") in values
    assert (
        "registry_key",
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SyncService",
    ) in values
    assert ("domain", "svchost32.exe") not in values
