"""
audits/serializers.py — 3 sérialiseurs (lecture, création client, mise à jour admin).
"""
from rest_framework import serializers

from .models import AuditPack, AuditRequest


class AuditPackSerializer(serializers.ModelSerializer):
    """Lecture seule — affiché côté public."""
    class Meta:
        model = AuditPack
        fields = [
            "id", "code", "name", "description",
            "included_services", "for_whom", "perimeter",
            "duration_days", "price",
        ]


class AuditRequestSerializer(serializers.ModelSerializer):
    """Lecture détaillée (owner ou admin)."""
    pack = AuditPackSerializer(read_only=True)
    client_info = serializers.SerializerMethodField()

    class Meta:
        model = AuditRequest
        fields = [
            "id", "reference", "client", "client_info", "pack",
            "status", "scope_notes", "internal_notes",
            "assigned_to", "submitted_at", "updated_at", "completed_at",
        ]
        read_only_fields = fields

    def get_client_info(self, obj):
        return {
            "email": obj.client.email,
            "first_name": obj.client.first_name,
            "last_name": obj.client.last_name,
            "company_name": obj.client.company_name,
        }


class AuditRequestCreateSerializer(serializers.ModelSerializer):
    """Client : POST /api/audits/. Le champ client est injecté par la view."""
    class Meta:
        model = AuditRequest
        fields = ["id", "reference", "pack", "scope_notes", "status", "submitted_at"]
        read_only_fields = ["id", "reference", "status", "submitted_at"]


class AuditRequestAdminUpdateSerializer(serializers.ModelSerializer):
    """Admin : PATCH /api/audits/{id}/."""
    class Meta:
        model = AuditRequest
        fields = ["status", "internal_notes", "assigned_to", "completed_at"]
