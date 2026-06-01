"""Tests du calculateur de score (services.py)."""

from apps.reports.services import (
    compute_score,
    compute_score_and_grade,
    normalize_severity,
    sanitize_findings,
)


def test_score_empty_is_100():
    assert compute_score([]) == 100


def test_score_per_severity():
    assert compute_score([{"severity": "Critical"}]) == 75
    assert compute_score([{"severity": "High"}]) == 90
    assert compute_score([{"severity": "Medium"}]) == 96
    assert compute_score([{"severity": "Low"}]) == 99


def test_score_combined():
    findings = [
        {"severity": "Critical"},
        {"severity": "High"},
        {"severity": "Medium"},
        {"severity": "Low"},
    ]
    # 100 - (25 + 10 + 4 + 1) = 60
    assert compute_score(findings) == 60


def test_score_clamps_to_zero():
    assert compute_score([{"severity": "Critical"}] * 10) == 0


def test_grade_thresholds():
    assert compute_score_and_grade([])[1] == "A"
    score, grade = compute_score_and_grade([{"severity": "High"}] * 3)
    assert (score, grade) == (70, "B")


def test_normalize_severity():
    assert normalize_severity("CRITICAL") == "Critical"
    assert normalize_severity("HIGH") == "High"
    assert normalize_severity("med") == "Medium"
    assert normalize_severity("unknown") == "Low"
    assert normalize_severity(None) == "Low"


def test_sanitize_drops_unknown_and_normalizes():
    raw = [
        {
            "severity": "high",
            "asset": "VPN",
            "evil": "<script>",
            "description": "x",
            "recommendation": "y",
        }
    ]
    clean = sanitize_findings(raw)
    assert "evil" not in clean[0]
    assert clean[0]["severity"] == "High"


def test_sanitize_rejects_non_list_and_non_dict():
    assert sanitize_findings(None) == []
    assert sanitize_findings("oops") == []
    raw = [{"severity": "High"}, "string", 42, None]
    assert len(sanitize_findings(raw)) == 1
