"""
training/views.py — Endpoints /api/training/.

  GET  /modules/              liste publiée + user_status
  GET  /modules/{id}/         détail (content_md)
  POST /modules/{id}/start/   marque le module comme commencé
  POST /modules/{id}/complete/ marque comme terminé
"""

from django.http import Http404
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TrainingModule, TrainingProgress
from .serializers import (
    TrainingModuleDetailSerializer,
    TrainingModuleListSerializer,
    TrainingProgressSerializer,
)

# ── Helpers ──────────────────────────────────────────────────────────────────


def _published_module_or_404(pk):
    try:
        return TrainingModule.objects.get(pk=pk, published_at__isnull=False)
    except TrainingModule.DoesNotExist:
        raise Http404 from None


# ── List / Detail ────────────────────────────────────────────────────────────


class TrainingModuleListView(generics.ListAPIView):
    """GET /api/training/modules/ — Liste des modules publiés."""

    serializer_class = TrainingModuleListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TrainingModule.objects.filter(published_at__isnull=False).order_by("id")


class TrainingModuleDetailView(generics.RetrieveAPIView):
    """GET /api/training/modules/{id}/ — Détail d'un module avec son contenu."""

    serializer_class = TrainingModuleDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TrainingModule.objects.filter(published_at__isnull=False)


# ── Actions de progression ───────────────────────────────────────────────────


class StartModuleView(APIView):
    """POST /api/training/modules/{id}/start/ — Marque comme commencé (idempotent)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        module = _published_module_or_404(pk)
        progress, _ = TrainingProgress.objects.get_or_create(
            user=request.user,
            module=module,
        )
        # Idempotent : ne reset pas un module déjà commencé/terminé
        if progress.status == TrainingProgress.Status.TO_START:
            progress.status = TrainingProgress.Status.IN_PROGRESS
            progress.started_at = timezone.now()
            progress.save(update_fields=["status", "started_at"])
        return Response(TrainingProgressSerializer(progress).data)


class CompleteModuleView(APIView):
    """POST /api/training/modules/{id}/complete/ — Marque comme terminé."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        module = _published_module_or_404(pk)
        progress, _ = TrainingProgress.objects.get_or_create(
            user=request.user,
            module=module,
        )
        now = timezone.now()
        progress.status = TrainingProgress.Status.COMPLETED
        progress.completed_at = now
        if not progress.started_at:
            progress.started_at = now
        progress.save(update_fields=["status", "started_at", "completed_at"])
        return Response(TrainingProgressSerializer(progress).data)
