"""
reports/services.py — Calculateur de score (server-side, single source of truth).
Le score ET le grade sont TOUJOURS calculés ici à partir des findings —
jamais en faisant confiance à des données envoyées par le client.
"""

# Pénalité par finding selon la sévérité.
SEVERITY_WEIGHTS = {
    "critical": 25,
    "high": 10,
    "medium": 4,
    "low": 1,
}

# Seuils de grade (score → grade).
GRADE_THRESHOLDS = [
    (90, "A"),
    (80, "B+"),
    (70, "B"),
    (55, "C"),
    (40, "D"),
    (20, "E"),
    (0,  "F"),
]

ALLOWED_FINDING_FIELDS = ("severity", "asset", "description", "recommendation")


def normalize_severity(value):
    """Normalise une sévérité en : Critical / High / Medium / Low (canonique)."""
    if not value:
        return "Low"
    v = str(value).strip().lower()
    if v in ("critical", "crit"):
        return "Critical"
    if v in ("high",):
        return "High"
    if v in ("medium", "med"):
        return "Medium"
    return "Low"


def sanitize_findings(raw_findings):
    """Garde uniquement les champs autorisés et normalise la sévérité."""
    if not isinstance(raw_findings, list):
        return []
    out = []
    for f in raw_findings:
        if not isinstance(f, dict):
            continue
        clean = {k: str(f.get(k, "")).strip() for k in ALLOWED_FINDING_FIELDS}
        clean["severity"] = normalize_severity(clean["severity"])
        out.append(clean)
    return out


def compute_score(findings):
    """Score 0-100 calculé à partir des findings normalisés."""
    if not findings:
        return 100
    deduction = sum(SEVERITY_WEIGHTS.get(f.get("severity", "Low").lower(), 1) for f in findings)
    return max(0, min(100, 100 - deduction))


def score_to_grade(score):
    """Score 0-100 → grade A / B+ / B / C / D / E / F."""
    for threshold, grade in GRADE_THRESHOLDS:
        if score >= threshold:
            return grade
    return "F"


def compute_score_and_grade(findings):
    """Renvoie (score, grade) calculés depuis une liste de findings."""
    score = compute_score(findings)
    return score, score_to_grade(score)
