"""
notifications/tests.py — Tests du modèle, de la tâche Celery,
de l'endpoint /me/ et des hooks déclenchés par audits.
"""
import pytest
from django.core import mail
from rest_framework import status

from apps.audits.models import AuditPack, AuditRequest
from apps.notifications.models import Notification
from apps.notifications.tasks import send_notification_email


# ── Modèle ───────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestNotificationModel:
    def test_default_status_is_queued(self, client_user):
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.REQUEST_RECEIVED,
            subject="Sujet",
            message="Contenu",
        )
        assert notif.status == "queued"
        assert notif.sent_at is None

    def test_str_contains_type_and_email(self, client_user):
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.STATUS_CHANGED,
            subject="Sujet",
            message="Contenu",
        )
        assert "status_changed" in str(notif)
        assert client_user.email in str(notif)


# ── Tâche Celery ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestSendNotificationEmail:
    def test_marks_notification_as_sent(self, client_user, settings):
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.REQUEST_RECEIVED,
            subject="Hello",
            message="Body",
        )
        send_notification_email(str(notif.id))
        notif.refresh_from_db()
        assert notif.status == "sent"
        assert notif.sent_at is not None
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [client_user.email]

    def test_returns_message_if_notification_missing(self):
        result = send_notification_email("00000000-0000-0000-0000-000000000000")
        assert "introuvable" in result


# ── GET /api/notifications/me/ ───────────────────────────────────────────────

@pytest.mark.django_db
class TestNotificationListEndpoint:
    URL = "/api/notifications/me/"

    def test_returns_only_own_notifications(
        self, auth_client, client_user, make_client_user,
    ):
        other = make_client_user(email="other@example.com")
        Notification.objects.create(
            user=client_user, type="request_received", subject="Mine", message="x",
        )
        Notification.objects.create(
            user=other, type="request_received", subject="Other", message="y",
        )
        resp = auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data) == 1
        assert resp.data[0]["subject"] == "Mine"

    def test_anonymous_returns_401(self, api_client):
        resp = api_client.get(self.URL)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ── Hooks (audits déclenche les notifs) ──────────────────────────────────────

@pytest.mark.django_db
class TestAuditHooks:
    def test_creating_request_creates_notification(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        resp = auth_client.post(
            "/api/audits/",
            {"pack": pack.pk, "scope_notes": "test"},
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED

        notifs = Notification.objects.filter(user=client_user)
        assert notifs.count() == 1
        assert notifs.first().type == "request_received"
        assert notifs.first().status == "sent"        # eager → déjà envoyé
        # Mail effectivement envoyé via locmem backend
        assert any(client_user.email in m.to for m in mail.outbox)

    def test_status_change_creates_notification(
        self, admin_auth_client, client_user,
    ):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = admin_auth_client.patch(
            f"/api/audits/{req.id}/",
            {"status": "in_progress"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK

        notifs = Notification.objects.filter(
            user=client_user, type="status_changed",
        )
        assert notifs.count() == 1
        assert "in_progress" in notifs.first().message

    def test_no_notification_when_status_unchanged(
        self, admin_auth_client, client_user,
    ):
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        # PATCH avec le même status
        resp = admin_auth_client.patch(
            f"/api/audits/{req.id}/",
            {"status": "pending", "internal_notes": "note"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert Notification.objects.filter(
            user=client_user, type="status_changed",
        ).count() == 0
