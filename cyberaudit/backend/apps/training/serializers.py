"""training/serializers.py — Sérialiseurs liste / détail avec statut user."""
from rest_framework import serializers

from .models import TrainingModule, TrainingProgress


class TrainingModuleListSerializer(serializers.ModelSerializer):
    """Vue liste — pas de contenu Markdown, mais le statut user."""
    user_status = serializers.SerializerMethodField()

    class Meta:
        model = TrainingModule
        fields = [
            "id", "slug", "title", "description",
            "duration_min", "level", "published_at", "user_status",
        ]
        read_only_fields = fields

    def get_user_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        progress = TrainingProgress.objects.filter(
            user=request.user, module=obj,
        ).first()
        return progress.status if progress else TrainingProgress.Status.TO_START


class TrainingModuleDetailSerializer(TrainingModuleListSerializer):
    """Vue détail — inclut le contenu Markdown."""

    class Meta(TrainingModuleListSerializer.Meta):
        fields = TrainingModuleListSerializer.Meta.fields + ["content_md"]
        read_only_fields = fields


class TrainingProgressSerializer(serializers.ModelSerializer):
    """Renvoyé après start/complete."""

    class Meta:
        model = TrainingProgress
        fields = ["status", "started_at", "completed_at"]
        read_only_fields = fields
