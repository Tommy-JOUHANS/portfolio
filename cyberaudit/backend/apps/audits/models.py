from django.db import models
from django.conf import settings


class Audit(models.Model):

    class Status(models.TextChoices):
        PENDING     = "pending",     "En attente"
        IN_PROGRESS = "in_progress", "En cours"
        COMPLETED   = "completed",   "Terminé"
        CANCELLED   = "cancelled",   "Annulé"

    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="audits",
    )
    status     = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Audit #{self.id} — {self.user.email} ({self.status})"
