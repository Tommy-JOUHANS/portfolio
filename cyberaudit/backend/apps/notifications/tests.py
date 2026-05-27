"""
notifications/tests.py — Tests unitaires pour l'app notifications.

Couverture :
  - Modèle Notification (création, __str__, types)
  - Service email (send_welcome_email, send_audit_status_email) — Resend mocké
  - Tâches Celery (task_send_welcome_email, task_send_audit_status_email)
"""

import pytest
from unittest.mock import MagicMock, patch

from apps.notifications.models import Notification


# ─────────────────────────────────────────────────────────────────────────────
# Modèle Notification
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestNotificationModel:

    def test_create_notification(self, client_user):
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.WELCOME,
            subject="Bienvenue !",
        )
        assert notif.pk is not None
        assert notif.success is True
        assert notif.error_msg == ""

    def test_str_contains_type_and_email(self, client_user):
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.AUDIT_STATUS,
            subject="Audit mis à jour",
        )
        result = str(notif)
        assert "audit_status" in result
        assert client_user.email in result

    def test_default_ordering_newest_first(self, client_user):
        Notification.objects.create(user=client_user, type=Notification.Type.WELCOME,      subject="1")
        Notification.objects.create(user=client_user, type=Notification.Type.AUDIT_STATUS, subject="2")
        notifs = list(Notification.objects.filter(user=client_user))
        # Le plus récent est en premier (ordering = ["-sent_at"])
        assert notifs[0].subject == "2"

    def test_notification_types_are_valid(self):
        valid = {c[0] for c in Notification.Type.choices}
        assert "welcome"      in valid
        assert "audit_status" in valid
        assert "report_ready" in valid


# ─────────────────────────────────────────────────────────────────────────────
# Service email — Resend mocké pour ne pas faire de vrais appels réseau
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestEmailService:

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_welcome_email_calls_resend(self, mock_send, client_user):
        mock_send.return_value = {"id": "fake-id-123"}

        from apps.notifications.emails import send_welcome_email
        result = send_welcome_email(client_user)

        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[0][0]
        assert call_kwargs["to"] == [client_user.email]
        assert "Bienvenue" in call_kwargs["subject"]
        assert client_user.first_name in call_kwargs["html"]

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_audit_status_email_calls_resend(self, mock_send, client_user):
        mock_send.return_value = {"id": "fake-id-456"}

        # Audit factice
        audit = MagicMock()
        audit.id = 99
        audit.status = "completed"

        from apps.notifications.emails import send_audit_status_email
        result = send_audit_status_email(client_user, audit)

        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[0][0]
        assert call_kwargs["to"] == [client_user.email]
        assert "99" in call_kwargs["subject"]

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_email_passes_from_address(self, mock_send, client_user):
        mock_send.return_value = {"id": "x"}
        from apps.notifications.emails import send_welcome_email
        send_welcome_email(client_user)

        call_kwargs = mock_send.call_args[0][0]
        assert "from" in call_kwargs
        assert "@" in call_kwargs["from"]


# ─────────────────────────────────────────────────────────────────────────────
# Tâches Celery — exécution synchrone (CELERY_TASK_ALWAYS_EAGER)
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestCeleryTasks:
    """
    Les tâches Celery avec bind=True doivent être appelées via .apply(args=[...])
    et non directement — sinon le corps de la fonction n'est jamais exécuté.
    """

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_task_send_welcome_email_executes_body(self, mock_send, client_user):
        mock_send.return_value = {"id": "task-welcome"}

        from apps.notifications.tasks import task_send_welcome_email
        result = task_send_welcome_email.apply(args=[str(client_user.id)])

        assert result.successful()
        mock_send.assert_called_once()

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_task_send_welcome_email_retries_on_error(self, mock_send, client_user):
        """Si Resend lève une exception, la tâche doit retenter (retry)."""
        mock_send.side_effect = Exception("Resend indisponible")

        from apps.notifications.tasks import task_send_welcome_email
        result = task_send_welcome_email.apply(args=[str(client_user.id)])

        # La tâche échoue après max_retries (eager mode = 1 tentative)
        assert result.failed()

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_task_send_audit_status_email_executes_body(self, mock_send, client_user):
        mock_send.return_value = {"id": "task-audit"}

        from apps.audits.models import Audit
        from apps.notifications.tasks import task_send_audit_status_email

        audit = Audit.objects.create(user=client_user, status="completed")
        result = task_send_audit_status_email.apply(args=[str(client_user.id), audit.id])

        assert result.successful()
        mock_send.assert_called_once()

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_task_send_audit_status_email_retries_on_error(self, mock_send, client_user):
        mock_send.side_effect = Exception("Erreur réseau")

        from apps.audits.models import Audit
        from apps.notifications.tasks import task_send_audit_status_email

        audit = Audit.objects.create(user=client_user, status="in_progress")
        result = task_send_audit_status_email.apply(args=[str(client_user.id), audit.id])

        assert result.failed()
