"""
audits/views.py — Endpoints /api/packs/ et /api/audits/ avec RBAC + notifications.
"""
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.notifications.models import Notification
from apps.notifications.services import create_and_send
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
    queryset = AuditPack.objects.all()
    serializer_class = AuditPackSerializer
    permission_classes = [AllowAny]


class PackDetailView(generics.RetrieveAPIView):
    queryset = AuditPack.objects.all()
    serializer_class = AuditPackSerializer
    permission_classes = [AllowAny]


# ── Demandes d'audit ─────────────────────────────────────────────────────────

class AuditRequestListCreateView(generics.ListCreateAPIView):
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
        audit = serializer.save(client=self.request.user)

        # ↓ NOTIF : accusé de réception automatique au client.
        create_and_send(
            user=audit.client,
            request=audit,
            type_=Notification.Type.REQUEST_RECEIVED,
            subject=f"Demande d'audit reçue — {audit.reference}",
            message=(
                f"Bonjour {audit.client.first_name},\n\n"
                f"Nous avons bien reçu votre demande d'audit ({audit.reference}) "
                f"pour le pack « {audit.pack.name} ».\n"
                "Vous recevrez une notification à chaque changement de statut.\n\n"
                "L'équipe CyberAudit & Solutions."
            ),
        )


class AuditRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AuditRequest.objects.select_related("pack", "client", "assigned_to")
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AuditRequestAdminUpdateSerializer
        return AuditRequestSerializer

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            raise PermissionDenied("Seul un administrateur peut modifier une demande.")
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        old_status = serializer.instance.status     # avant save
        audit = serializer.save()                    # après save

        # ↓ NOTIF : informer le client si le statut a changé.
        if old_status != audit.status:
            create_and_send(
                user=audit.client,
                request=audit,
                type_=Notification.Type.STATUS_CHANGED,
                subject=f"Statut mis à jour — {audit.reference}",
                message=(
                    f"Bonjour {audit.client.first_name},\n\n"
                    f"Le statut de votre demande {audit.reference} est passé de "
                    f"« {old_status} » à « {audit.status} ».\n\n"
                    "L'équipe CyberAudit & Solutions."
                ),
            )

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise PermissionDenied("Seul un administrateur peut archiver une demande.")
        instance.status = AuditRequest.Status.ARCHIVED
        instance.save(update_fields=["status", "updated_at"])
