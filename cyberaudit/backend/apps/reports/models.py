"""
reports/models.py — Modèle AuditReport (1 rapport par AuditRequest).
"""
import uuid

from django.db import models


class AuditReport(models.Model):
    """Rapport de vulnérabilité associé à une demande d'audit terminée."""

    class Grade(models.TextChoices):
        A = "A", "A — Excellent"
        B_PLUS = "B+", "B+ — Très bon"
        B = "B", "B — Bon"
        C = "C", "C — Moyen"
        D = "D", "D — Faible"
        E = "E", "E — Mauvais"
        F = "F", "F — Critique"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit_request = models.OneToOneField(
        "audits.AuditRequest",
        on_delete=models.CASCADE,
        related_name="report",
    )
    summary = models.TextField(blank=True)
    verdict = models.CharField(max_length=255, blank=True)
    grade = models.CharField(max_length=2, choices=Grade.choices, default=Grade.C)
    security_score = models.PositiveSmallIntegerField(default=50)  # 0-100
    findings = models.JSONField(default=list, blank=True)  # [{severity, asset, description, recommendation}, ...]
    pdf_path = models.CharField(max_length=255, blank=True)
    generated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "audit_reports"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Report {self.audit_request.reference} (Grade {self.grade})"
