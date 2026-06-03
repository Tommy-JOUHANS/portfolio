"""
training/tests.py — Tests modèles + endpoints + idempotence start/complete.
"""

import pytest
from django.db import IntegrityError
from rest_framework import status

from apps.training.models import TrainingModule, TrainingProgress

# ── Modèles ──────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestTrainingModels:
    def test_five_modules_seeded(self):
        assert TrainingModule.objects.count() == 5
        slugs = set(TrainingModule.objects.values_list("slug", flat=True))
        assert {"anti-phishing", "mfa", "wifi-vpn", "data-backup", "incident-response"} == slugs

    def test_all_seeded_modules_are_published(self):
        assert TrainingModule.objects.filter(published_at__isnull=True).count() == 0

    def test_unique_user_module_constraint(self, client_user):
        mod = TrainingModule.objects.first()
        TrainingProgress.objects.create(user=client_user, module=mod)
        with pytest.raises(IntegrityError):
            TrainingProgress.objects.create(user=client_user, module=mod)


# ── GET /api/training/modules/ ───────────────────────────────────────────────


@pytest.mark.django_db
class TestTrainingList:
    URL = "/api/training/modules/"

    def test_anonymous_returns_401(self, api_client):
        resp = api_client.get(self.URL)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_sees_5_modules(self, auth_client):
        resp = auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data["results"]) == 5

    def test_unpublished_modules_are_filtered_out(self, auth_client):
        # On crée un module non publié → ne doit PAS apparaître
        TrainingModule.objects.create(slug="brouillon", title="WIP", published_at=None)
        resp = auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data["results"]) == 5
        assert "brouillon" not in {m["slug"] for m in resp.data["results"]}

    def test_user_status_defaults_to_to_start(self, auth_client):
        resp = auth_client.get(self.URL)
        for module in resp.data["results"]:
            assert module["user_status"] == "to_start"


# ── POST /api/training/modules/{id}/start/ ───────────────────────────────────


@pytest.mark.django_db
class TestStartModule:
    def _url(self, pk):
        return f"/api/training/modules/{pk}/start/"

    def test_start_creates_progress_in_progress(self, auth_client, client_user):
        mod = TrainingModule.objects.first()
        resp = auth_client.post(self._url(mod.id))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["status"] == "in_progress"
        assert resp.data["started_at"] is not None
        # Vérif DB
        progress = TrainingProgress.objects.get(user=client_user, module=mod)
        assert progress.status == "in_progress"

    def test_start_is_idempotent(self, auth_client, client_user):
        """Appeler start 2× ne réinitialise pas started_at."""
        mod = TrainingModule.objects.first()
        r1 = auth_client.post(self._url(mod.id))
        first_start = r1.data["started_at"]
        r2 = auth_client.post(self._url(mod.id))
        assert r2.data["started_at"] == first_start

    def test_start_on_unknown_module_returns_404(self, auth_client):
        resp = auth_client.post(self._url(99999))
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ── POST /api/training/modules/{id}/complete/ ────────────────────────────────


@pytest.mark.django_db
class TestCompleteModule:
    def _url(self, pk):
        return f"/api/training/modules/{pk}/complete/"

    def test_complete_module_already_started(self, auth_client, client_user):
        mod = TrainingModule.objects.first()
        # On démarre d'abord
        auth_client.post(f"/api/training/modules/{mod.id}/start/")
        # Puis on complète
        resp = auth_client.post(self._url(mod.id))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["status"] == "completed"
        assert resp.data["completed_at"] is not None

    def test_complete_creates_progress_if_missing(self, auth_client, client_user):
        """Complete sans start préalable doit créer la progression directement."""
        mod = TrainingModule.objects.first()
        resp = auth_client.post(self._url(mod.id))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["status"] == "completed"
        assert resp.data["started_at"] is not None  # auto-rempli
