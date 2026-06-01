"""
core/permissions.py — Classes de permissions RBAC réutilisables.

Référence : doc technique Stage 3 §4.3 (RBAC frontend + backend cohérent).
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdmin(BasePermission):
    """Accès réservé aux comptes role=admin."""

    message = "Action réservée aux administrateurs."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsOwner(BasePermission):
    """Accès réservé au propriétaire de l'objet (champ `client` par défaut)."""

    message = "Vous n'êtes pas le propriétaire de cette ressource."
    owner_field = "client"

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user


class IsAdminOrOwner(BasePermission):
    """Admin = tout ; client = uniquement ses propres objets."""

    message = "Vous n'avez pas accès à cette ressource."
    owner_field = "client"

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        owner = getattr(obj, self.owner_field, None)
        return owner == request.user


class ReadOnly(BasePermission):
    """Lecture seule (GET/HEAD/OPTIONS) — utile pour les endpoints publics."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
