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
    def test_marks_notification_as_sent(self, client_user):
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
