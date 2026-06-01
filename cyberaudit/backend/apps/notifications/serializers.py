"""notifications/serializers.py — Sérialiseur lecture pour l'endpoint /me/."""

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    request_reference = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "subject",
            "message",
            "status",
            "request_reference",
            "sent_at",
            "created_at",
        ]
        read_only_fields = fields

    def get_request_reference(self, obj):
        return obj.request.reference if obj.request else None
