"""
training/models.py — Modules de sensibilisation cyber + progression utilisateur.

  TrainingModule    : catalogue de modules (anti-phishing, MFA, etc.)
  TrainingProgress  : 1 ligne par couple (user, module) — UNIQUE
"""
from django.conf import settings
from django.db import models


class TrainingModule(models.Model):
    """Module de sensibilisation cyber (catalogue)."""

    class Level(models.TextChoices):
        BEGINNER = "beginner", "Débutant"
        INTERMEDIATE = "intermediate", "Intermédiaire"
        ADVANCED = "advanced", "Avancé"

    slug = models.SlugField(unique=True, max_length=80)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content_md = models.TextField(blank=True)
    duration_min = models.PositiveSmallIntegerField(default=10)
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "training_modules"
        ordering = ["id"]

    def __str__(self):
        return self.title


class TrainingProgress(models.Model):
    """Progression d'un user sur un module — 1 ligne max par couple."""

    class Status(models.TextChoices):
        TO_START = "to_start", "À commencer"
        IN_PROGRESS = "in_progress", "En cours"
        COMPLETED = "completed", "Terminé"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="training_progress",
    )
    module = models.ForeignKey(
        TrainingModule,
        on_delete=models.CASCADE,
        related_name="progress_entries",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TO_START,
        db_index=True,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "training_progress"
        constraints = [
            models.UniqueConstraint(fields=["user", "module"], name="uniq_user_module"),
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.email} → {self.module.slug} ({self.status})"
