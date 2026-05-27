"""
notifications/models.py — Modèle Notification.

Une notification = un email à envoyer à un utilisateur, lié facultativement
à une AuditRequest. Cycle de vie :  queued → sent  (ou failed après 3 retry).
"""
import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Email transactionnel (cf. doc Stage 3 §4.2 schéma NOTIFICATION)."""

    class Type(models.TextChoices):
        REQUEST_RECEIVED = "request_received", "Request received"
        STATUS_CHANGED = "status_changed", "Status changed"
        REPORT_READY = "report_ready", "Report ready"
        GENERATION_FAILED = "generation_failed", "Generation failed"

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    request = models.ForeignKey(
        "audits.AuditRequest",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    type = models.CharField(max_length=32, choices=Type.choices)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"[{self.type}] {self.subject} → {self.user.email}"
