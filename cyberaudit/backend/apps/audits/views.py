"""
audits/views.py — Endpoints /api/packs/ et /api/audits/ avec RBAC.
"""
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.permissions import IsAdminOrOwner

from .models import AuditPack, AuditRequest
from .serializers import (
    AuditPackSerializer,
    AuditRequestAdminUpdateSerializer,
    AuditRequestCreateSerializer,
    AuditRequestSerializer,
)


# ── Packs (publics) ──────────────────────────────────────────────────────────

class PackListView(generics.ListAPIView):
    """GET /api/packs/ — Liste publique des 4 packs."""
    queryset = AuditPack.objects.all()
    serializer_class = AuditPackSerializer
    permission_classes = [AllowAny]


class PackDetailView(generics.RetrieveAPIView):
    """GET /api/packs/{id}/ — Détail d'un pack."""
    queryset = AuditPack.objects.all()
    serializer_class = AuditPackSerializer
    permission_classes = [AllowAny]


# ── Demandes d'audit ─────────────────────────────────────────────────────────

class AuditRequestListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/audits/   client → ses demandes / admin → toutes.
    POST /api/audits/   client uniquement.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = AuditRequest.objects.select_related("pack", "client", "assigned_to")
        if self.request.user.role == "admin":
            return qs
        return qs.filter(client=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AuditRequestCreateSerializer
        return AuditRequestSerializer

    def perform_create(self, serializer):
        if self.request.user.role == "admin":
            raise PermissionDenied("Seuls les clients peuvent soumettre une demande.")
        serializer.save(client=self.request.user)


class AuditRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/audits/{id}/   owner ou admin.
    PATCH  /api/audits/{id}/   admin uniquement (status, notes, assigned_to).
    DELETE /api/audits/{id}/   admin uniquement → archive (soft delete).
    """
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
        qs = AuditRequest.objects.select_related("pack", "client", "assigned_to")
        if self.request.user.role == "admin":
            return qs
        return qs.filter(client=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AuditRequestAdminUpdateSerializer
        return AuditRequestSerializer

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            raise PermissionDenied("Seul un administrateur peut modifier une demande.")
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise PermissionDenied("Seul un administrateur peut archiver une demande.")
        instance.status = AuditRequest.Status.ARCHIVED
        instance.save(update_fields=["status", "updated_at"])
