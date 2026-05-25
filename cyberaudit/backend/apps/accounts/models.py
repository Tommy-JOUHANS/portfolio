"""
accounts/models.py — Modèle User personnalisé.

Points clés :
  - UUID comme clé primaire (prévient les IDOR)
  - email comme identifiant de connexion (USERNAME_FIELD)
  - Rôle binaire : client | admin (RBAC)
  - Héritage AbstractBaseUser + PermissionsMixin (compatibilité Django admin)
"""

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# ─────────────────────────────────────────────────────────────────────────────
# Manager personnalisé
# ─────────────────────────────────────────────────────────────────────────────

class UserManager(BaseUserManager):
    """Manager qui utilise l'email comme identifiant principal."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


# ─────────────────────────────────────────────────────────────────────────────
# Modèle principal
# ─────────────────────────────────────────────────────────────────────────────

class User(AbstractBaseUser, PermissionsMixin):
    """Utilisateur CyberAudit — client PME ou admin interne."""

    class Role(models.TextChoices):
        CLIENT = "client", "Client"
        ADMIN  = "admin",  "Administrateur"

    # ── Identité ──────────────────────────────────────────────────────────────
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email        = models.EmailField(unique=True)
    first_name   = models.CharField(max_length=50)
    last_name    = models.CharField(max_length=50)
    company_name = models.CharField(max_length=100, blank=True)

    # ── Rôle & accès ──────────────────────────────────────────────────────────
    role     = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)
    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)  # accès à l'admin Django

    # ── Horodatage ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []           # createsuperuser ne demande que email + pwd

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
