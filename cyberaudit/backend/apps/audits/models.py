"""
audits/models.py — Modèles AuditPack et AuditRequest.

  AuditPack    : catalogue figé des 4 packs (Audit / Security / Protection / Premium).
  AuditRequest : demande d'audit soumise par un client, suivie par un admin.
"""
import uuid
from datetime import datetime

from django.conf import settings
from django.db import models, transaction


class AuditPack(models.Model):
    """Pack commercial (catalogue fixe — pas créé par les utilisateurs)."""

    class Code(models.TextChoices):
        AUDIT = "audit", "Audit"
        SECURITY = "security", "Security"
        PROTECTION = "protection", "Protection"
        PREMIUM = "premium", "Premium"

    code = models.CharField(max_length=20, choices=Code.choices, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    included_services = models.TextField(blank=True)
    for_whom = models.TextField(blank=True)
    perimeter = models.TextField(blank=True)
    duration_days = models.PositiveSmallIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "audit_packs"
        ordering = ["price"]

    def __str__(self):
        return self.name


class AuditRequest(models.Model):
    """Demande d'audit (UUID, référence DOSSIER-YYYY-NNNN, statut, RBAC)."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        ARCHIVED = "archived", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=20, unique=True, db_index=True, blank=True)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="audit_requests",
    )
    pack = models.ForeignKey(
        AuditPack,
        on_delete=models.PROTECT,
        related_name="requests",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    scope_notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_requests",
    )
    internal_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "audit_requests"
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["client", "-submitted_at"]),
        ]

    def __str__(self):
        return f"{self.reference} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self._generate_reference()
        super().save(*args, **kwargs)

    @classmethod
    def _generate_reference(cls):
        """Génère DOSSIER-YYYY-NNNN de manière atomique (anti-collision)."""
        year = datetime.now().year
        prefix = f"DOSSIER-{year}-"
        with transaction.atomic():
            last = (
                cls.objects.select_for_update()
                .filter(reference__startswith=prefix)
                .order_by("-reference")
                .first()
            )
            next_num = (int(last.reference.split("-")[-1]) + 1) if last else 1
        return f"{prefix}{next_num:04d}"
