from types import SimpleNamespace

from app.services.stix import build_stix_bundle


def test_build_stix_bundle_contains_indicators_and_relationships() -> None:
    technique = SimpleNamespace(
        id=1,
        attack_id="T1071.001",
        tactic="Command and Control",
        technique_name="Web Protocols",
        reference_url="https://attack.mitre.org/techniques/T1071/001/",
    )
    ioc = SimpleNamespace(
        id=1,
        incident_id=1,
        type=SimpleNamespace(value="domain"),
        normalized_value="evil.example.com",
        description="Suspicious domain",
        confidence=0.8,
        attack_techniques=[technique],
    )
    feed = SimpleNamespace(name="Demo feed", incident_id=1, iocs=[ioc])

    bundle = build_stix_bundle(feed)
    object_types = [item["type"] for item in bundle["objects"]]
    assert bundle["type"] == "bundle"
    assert "indicator" in object_types
    assert "attack-pattern" in object_types
    assert "relationship" in object_types
