"""
audits/tests.py — Tests pytest pour AuditPack + AuditRequest.

Couverture :
  - Modèle AuditPack : 4 packs seedés
  - Modèle AuditRequest : référence auto, unicité, statut par défaut
  - GET /api/packs/ : public, retourne 4 packs
  - GET /api/audits/ : client (filtré) vs admin (tout) vs anonyme (401)
  - POST /api/audits/ : client OK / admin 403 / anonyme 401
  - GET /api/audits/{id}/ : owner OK / autre client 404 / admin OK
  - PATCH /api/audits/{id}/ : admin OK / client 403
  - DELETE /api/audits/{id}/ : admin → archive / client 403
"""

import pytest
from rest_framework import status

from apps.audits.models import AuditPack, AuditRequest

# ── Modèle AuditPack ─────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditPackModel:
    def test_four_packs_seeded(self):
        assert AuditPack.objects.count() == 4
        assert set(AuditPack.objects.values_list("code", flat=True)) == {
            "audit",
            "security",
            "protection",
            "premium",
        }

    def test_ordered_by_price(self):
        prices = list(AuditPack.objects.values_list("price", flat=True))
        assert prices == sorted(prices)


# ── Modèle AuditRequest ──────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditRequestModel:
    def test_reference_auto_generated(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        assert req.reference.startswith("DOSSIER-")
        assert req.reference.endswith("-0001")

    def test_default_status_is_pending(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        assert req.status == "pending"

    def test_two_creates_have_distinct_references(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        r1 = AuditRequest.objects.create(client=client_user, pack=pack)
        r2 = AuditRequest.objects.create(client=client_user, pack=pack)
        assert r1.reference != r2.reference
        assert r2.reference.endswith("-0002")


# ── GET /api/packs/ ──────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestPackListView:
    URL = "/api/packs/"

    def test_list_public_returns_200_and_4_packs(self, api_client):
        resp = api_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data["results"]) == 4


# ── POST /api/audits/ ────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditRequestCreate:
    URL = "/api/audits/"

    def test_client_can_create(self, auth_client):
        pack = AuditPack.objects.get(code="audit")
        resp = auth_client.post(
            self.URL,
            {
                "pack": pack.pk,
                "scope_notes": "Audit du serveur de fichiers.",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["status"] == "pending"
        assert resp.data["reference"].startswith("DOSSIER-")

    def test_admin_cannot_create(self, admin_auth_client):
        pack = AuditPack.objects.get(code="audit")
        resp = admin_auth_client.post(
            self.URL,
            {
                "pack": pack.pk,
                "scope_notes": "tentative",
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_returns_401(self, api_client):
        resp = api_client.post(self.URL, {"pack": 1, "scope_notes": ""})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ── GET /api/audits/ ─────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditRequestList:
    URL = "/api/audits/"

    def test_client_sees_only_own_requests(
        self,
        auth_client,
        client_user,
        make_client_user,
    ):
        pack = AuditPack.objects.get(code="audit")
        other = make_client_user(email="other@example.com")
        AuditRequest.objects.create(client=client_user, pack=pack)
        AuditRequest.objects.create(client=other, pack=pack)
        resp = auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data["results"]) == 1

    def test_admin_sees_all_requests(
        self,
        admin_auth_client,
        client_user,
        make_client_user,
    ):
        pack = AuditPack.objects.get(code="audit")
        other = make_client_user(email="other@example.com")
        AuditRequest.objects.create(client=client_user, pack=pack)
        AuditRequest.objects.create(client=other, pack=pack)
        resp = admin_auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data["results"]) == 2


# ── GET /api/audits/{id}/ ────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditRequestDetail:
    def _url(self, pk):
        return f"/api/audits/{pk}/"

    def test_owner_can_read(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = auth_client.get(self._url(req.id))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["reference"] == req.reference

    def test_other_client_gets_404(self, api_client, make_client_user):
        from rest_framework_simplejwt.tokens import RefreshToken

        client_a = make_client_user(email="a@example.com")
        client_b = make_client_user(email="b@example.com")
        pack = AuditPack.objects.get(code="audit")
        req_a = AuditRequest.objects.create(client=client_a, pack=pack)
        # Auth en tant que B
        token = RefreshToken.for_user(client_b).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = api_client.get(self._url(req_a.id))
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_can_read_any(self, admin_auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = admin_auth_client.get(self._url(req.id))
        assert resp.status_code == status.HTTP_200_OK


# ── PATCH /api/audits/{id}/ ──────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditRequestUpdate:
    def _url(self, pk):
        return f"/api/audits/{pk}/"

    def test_admin_can_patch_status(self, admin_auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = admin_auth_client.patch(
            self._url(req.id),
            {"status": "in_progress"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        req.refresh_from_db()
        assert req.status == "in_progress"

    def test_client_cannot_patch(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = auth_client.patch(
            self._url(req.id),
            {"status": "completed"},
            format="json",
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN


# ── DELETE /api/audits/{id}/ ─────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditRequestDelete:
    def _url(self, pk):
        return f"/api/audits/{pk}/"

    def test_admin_archives_via_delete(self, admin_auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = admin_auth_client.delete(self._url(req.id))
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        req.refresh_from_db()
        assert req.status == "archived"

    def test_client_cannot_delete(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = auth_client.delete(self._url(req.id))
        assert resp.status_code == status.HTTP_403_FORBIDDEN
