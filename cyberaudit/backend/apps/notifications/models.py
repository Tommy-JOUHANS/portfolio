# ========================================================================
# apps/notifications/models.py
# Historique des notifications envoyées aux utilisateurs.
# ========================================================================
from django.db import models
from django.conf import settings


class Notification(models.Model):

    class Type(models.TextChoices):
        WELCOME      = "welcome",      "Bienvenue"
        AUDIT_STATUS = "audit_status", "Statut audit"
        REPORT_READY = "report_ready", "Rapport disponible"

    user      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type      = models.CharField(max_length=30, choices=Type.choices)
    subject   = models.CharField(max_length=255)
    sent_at   = models.DateTimeField(auto_now_add=True)
    success   = models.BooleanField(default=True)
    error_msg = models.TextField(blank=True)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"[{self.type}] → {self.user.email} ({self.sent_at:%Y-%m-%d})"
