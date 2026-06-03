"""
audits/views.py — /api/packs/ and /api/audits/ endpoints with RBAC + notifications.
"""

from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.notifications.models import Notification
from apps.notifications.services import create_and_send

from .models import AuditPack, AuditRequest
from .serializers import (
    AuditPackSerializer,
    AuditRequestAdminUpdateSerializer,
    AuditRequestCreateSerializer,
    AuditRequestSerializer,
)


# ── Packs (public) ───────────────────────────────────────────────────────────
class PackListView(generics.ListAPIView):
    queryset = AuditPack.objects.all()
    serializer_class = AuditPackSerializer
    permission_classes = [AllowAny]


class PackDetailView(generics.RetrieveAPIView):
    queryset = AuditPack.objects.all()
    serializer_class = AuditPackSerializer
    permission_classes = [AllowAny]


# ── Audit requests ───────────────────────────────────────────────────────────
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
            raise PermissionDenied("Only clients can submit a request.")
        audit = serializer.save(client=self.request.user)
        # NOTIF: automatic acknowledgement to client.
        create_and_send(
            user=audit.client,
            request=audit,
            type_=Notification.Type.REQUEST_RECEIVED,
            subject=f"Audit request received — {audit.reference}",
            message=(
                f"Hello {audit.client.first_name},\n\n"
                f"We have received your audit request ({audit.reference}) "
                f"for the \"{audit.pack.name}\" pack.\n"
                "You will receive a notification at each status change.\n\n"
                "The CyberAudit & Solutions team."
            ),
        )


class AuditRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

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
            raise PermissionDenied("Only an administrator can modify a request.")
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        old_status = serializer.instance.status  # before save
        audit = serializer.save()  # after save
        # NOTIF: notify client if status changed.
        if old_status != audit.status:
            create_and_send(
                user=audit.client,
                request=audit,
                type_=Notification.Type.STATUS_CHANGED,
                subject=f"Status updated — {audit.reference}",
                message=(
                    f"Hello {audit.client.first_name},\n\n"
                    f"Your request {audit.reference} status changed from "
                    f"\"{old_status}\" to \"{audit.status}\".\n\n"
                    "The CyberAudit & Solutions team."
                ),
            )

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise PermissionDenied("Only an administrator can archive a request.")
        instance.status = AuditRequest.Status.ARCHIVED
        instance.save(update_fields=["status", "updated_at"])
