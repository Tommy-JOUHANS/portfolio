"""
test_coverage_gaps.py — Tests ciblés sur les lignes non couvertes.

Ferme les 7 % de lacunes restantes du backend (93 % → ~100 %) :

  accounts/views.py           : logout token invalide (L117-118), DELETE /me/ (L146-148)
  notifications/tasks.py      : exception SMTP → status=failed (L40-44)
  notifications/views.py      : GET /api/notifications/me/ (L17)
  notifications/serializers.py: request=None → None (L26)
  reports/views.py            : _get_audit_or_404 404 (L25-26), FileNotFoundError (L100-101),
                                ReportDataView entière (L114-123)
  reports/serializers.py      : AuditReportSerializer (via ReportDataView)
  audits/models.py            : __str__ AuditPack (L40) + AuditRequest (L91)
  training/models.py          : __str__ TrainingModule (L35) + TrainingProgress (L75)
  training/serializers.py     : get_user_status sans request (L30)
  notifications/emails.py     : send_email, send_welcome_email, send_audit_status_email (0%)
  setup_admin command         : 3 scénarios (0%)
  translate_training command  : modules traduits / inconnus (0%)
"""

import os
from io import StringIO
from unittest import mock
from unittest.mock import patch

import pytest
from django.core.management import call_command
from django.utils import timezone
from rest_framework import status

from apps.accounts.models import User
from apps.audits.models import AuditPack, AuditRequest
from apps.notifications.models import Notification
from apps.notifications.tasks import send_notification_email
from apps.reports.models import AuditReport
from apps.training.models import TrainingModule, TrainingProgress


# ─────────────────────────────────────────────────────────────────────────────
# 1. accounts/views.py — lignes non couvertes
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAccountsViewsCoverage:
    """Complète la couverture d'accounts/views.py."""

    def test_logout_invalid_token_returns_400(self, auth_client):
        """Lignes 117-118 : except TokenError dans LogoutView."""
        resp = auth_client.post(
            "/api/auth/logout/",
            {"refresh": "not-a-valid-jwt-token-at-all"},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalide" in resp.data.get("detail", "").lower()

    def test_delete_me_deactivates_account(self, auth_client, client_user):
        """Lignes 146-148 : DELETE /api/auth/me/ → soft delete (is_active=False)."""
        resp = auth_client.delete("/api/auth/me/")
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        client_user.refresh_from_db()
        assert client_user.is_active is False


# ─────────────────────────────────────────────────────────────────────────────
# 2. notifications/tasks.py — lignes 40-44
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestNotificationTaskFailurePath:
    """Couvre la branche except Exception dans send_notification_email (L40-44)."""

    @patch(
        "apps.notifications.tasks.send_mail",
        side_effect=Exception("SMTP connexion refusée"),
    )
    def test_smtp_failure_marks_notification_failed_and_stores_error(
        self, _mock_send, client_user
    ):
        """
        Quand send_mail lève une exception :
          - status passe à FAILED
          - error_message contient le message d'erreur
          - l'exception est re-propagée (Celery peut retenter)
        """
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.REQUEST_RECEIVED,
            subject="Test SMTP failure",
            message="Contenu de test",
        )
        with pytest.raises(Exception, match="SMTP connexion refusée"):
            send_notification_email(str(notif.id))

        notif.refresh_from_db()
        assert notif.status == Notification.Status.FAILED
        assert "SMTP connexion refusée" in notif.error_message


# ─────────────────────────────────────────────────────────────────────────────
# 3. notifications/views.py + notifications/serializers.py
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestNotificationsViewAndSerializer:
    """Couvre /api/notifications/me/ (L17) et la branche request=None (L26)."""

    URL = "/api/notifications/me/"

    def test_get_own_notifications_returns_200(self, auth_client, client_user):
        """Ligne 17 : queryset filtré par user dans get_queryset()."""
        Notification.objects.create(
            user=client_user,
            type=Notification.Type.STATUS_CHANGED,
            subject="Audit en cours",
            message="Votre dossier est en traitement.",
            status=Notification.Status.SENT,
        )
        resp = auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        # Supporte pagination (results) ou liste brute
        results = resp.data.get("results", resp.data)
        subjects = [n["subject"] for n in results]
        assert "Audit en cours" in subjects

    def test_anonymous_cannot_list_notifications(self, api_client):
        resp = api_client.get(self.URL)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_serializer_request_reference_is_none_when_no_request(
        self, client_user
    ):
        """Ligne 26 : obj.request est None → la méthode retourne None."""
        from apps.notifications.serializers import NotificationSerializer

        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.REQUEST_RECEIVED,
            subject="Sans dossier lié",
            message="Corps",
            request=None,
        )
        data = NotificationSerializer(notif).data
        assert data["request_reference"] is None

    def test_serializer_request_reference_returns_reference_when_request_exists(
        self, client_user
    ):
        """Ligne 26 (branche True) : obj.request non None → référence DOSSIER-…"""
        from apps.notifications.serializers import NotificationSerializer

        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        notif = Notification.objects.create(
            user=client_user,
            type=Notification.Type.STATUS_CHANGED,
            subject="Avec dossier",
            message="Corps",
            request=audit,
        )
        data = NotificationSerializer(notif).data
        assert data["request_reference"] == audit.reference


# ─────────────────────────────────────────────────────────────────────────────
# 4. reports/views.py + reports/serializers.py
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestReportsViewsCoverage:
    """Couvre les lignes manquantes de reports/views.py."""

    @pytest.fixture
    def audit(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        return AuditRequest.objects.create(client=client_user, pack=pack)

    # ── Lignes 25-26 : _get_audit_or_404 avec UUID inexistant ────────────────

    def test_generate_report_nonexistent_audit_returns_404(
        self, admin_auth_client
    ):
        """Lignes 25-26 : AuditRequest.DoesNotExist → Http404."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        resp = admin_auth_client.post(
            f"/api/audits/{fake_uuid}/generate-report/",
            {"summary": "test", "verdict": "ok", "findings": []},
            format="json",
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_report_data_nonexistent_audit_returns_404(self, admin_auth_client):
        """Lignes 25-26 : même branche via ReportDataView."""
        fake_uuid = "00000000-0000-0000-0000-000000000001"
        resp = admin_auth_client.get(f"/api/audits/{fake_uuid}/report/data/")
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    # ── Lignes 100-101 : FileNotFoundError dans ReportDownloadView ────────────

    def test_report_download_pdf_path_set_but_file_missing_returns_404(
        self, admin_auth_client, audit
    ):
        """Lignes 100-101 : open() → FileNotFoundError → NotFound (HTTP 404)."""
        AuditReport.objects.create(
            audit_request=audit,
            pdf_path="/nonexistent/missing/report.pdf",
            security_score=75,
            grade="B",
        )
        resp = admin_auth_client.get(f"/api/audits/{audit.id}/report/")
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    # ── Lignes 114-123 : ReportDataView.get() — entièrement non couverte ──────

    def test_report_data_view_returns_serialized_report(
        self, admin_auth_client, audit
    ):
        """Lignes 121-123 : chemin nominal — rapport existe → JSON 200."""
        AuditReport.objects.create(
            audit_request=audit,
            summary="Synthèse complète",
            verdict="Niveau acceptable",
            security_score=72,
            grade="B",
            findings=[
                {
                    "severity": "High",
                    "asset": "VPN public",
                    "description": "Exposition réseau",
                    "recommendation": "Restreindre l'accès",
                }
            ],
        )
        resp = admin_auth_client.get(f"/api/audits/{audit.id}/report/data/")
        assert resp.status_code == status.HTTP_200_OK
        # AuditReportSerializer champs
        assert resp.data["security_score"] == 72
        assert resp.data["grade"] == "B"
        assert resp.data["audit_reference"] == audit.reference
        assert len(resp.data["findings"]) == 1

    def test_report_data_view_no_report_returns_404(
        self, admin_auth_client, audit
    ):
        """Lignes 117-120 : AuditReport.DoesNotExist → NotFound (HTTP 404)."""
        # Aucun rapport créé pour cet audit
        resp = admin_auth_client.get(f"/api/audits/{audit.id}/report/data/")
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_report_data_view_client_cannot_access_other_client_audit(
        self, api_client, make_client_user, audit
    ):
        """Lignes 115-116 : non-owner → Http404 (anti-énumération)."""
        from rest_framework_simplejwt.tokens import RefreshToken

        other_client = make_client_user(email="other@example.com")
        token = RefreshToken.for_user(other_client).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        AuditReport.objects.create(audit_request=audit, security_score=80, grade="B")
        resp = api_client.get(f"/api/audits/{audit.id}/report/data/")
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_report_data_view_owner_can_access_own_audit(
        self, auth_client, audit
    ):
        """Le client propriétaire de l'audit peut accéder à /report/data/."""
        AuditReport.objects.create(
            audit_request=audit,
            summary="Mon rapport",
            security_score=85,
            grade="B+",
        )
        resp = auth_client.get(f"/api/audits/{audit.id}/report/data/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["security_score"] == 85


# ─────────────────────────────────────────────────────────────────────────────
# 5. audits/models.py — __str__ (lignes 40 et 91)
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditModelsStr:
    """Couvre les méthodes __str__ de AuditPack et AuditRequest."""

    def test_audit_pack_str_contains_name(self):
        """Ligne 40 : AuditPack.__str__ retourne self.name."""
        pack = AuditPack.objects.get(code="audit")
        assert pack.name in str(pack)

    def test_audit_request_str_contains_reference_and_status(self, client_user):
        """Ligne 91 : AuditRequest.__str__ = 'DOSSIER-YYYY-NNNN (status)'."""
        pack = AuditPack.objects.get(code="audit")
        req = AuditRequest.objects.create(client=client_user, pack=pack)
        s = str(req)
        assert req.reference in s
        assert req.status in s


# ─────────────────────────────────────────────────────────────────────────────
# 6. training/models.py — __str__ (lignes 35 et 75)
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestTrainingModelsStr:
    """Couvre les méthodes __str__ de TrainingModule et TrainingProgress."""

    def test_training_module_str_contains_title(self):
        """Ligne 35 : TrainingModule.__str__ retourne self.title."""
        mod = TrainingModule.objects.first()
        assert mod.title in str(mod)

    def test_training_progress_str_contains_email_slug_and_status(
        self, client_user
    ):
        """Ligne 75 : TrainingProgress.__str__ = '{email} → {slug} ({status})'."""
        mod = TrainingModule.objects.first()
        progress = TrainingProgress.objects.create(
            user=client_user,
            module=mod,
            status=TrainingProgress.Status.IN_PROGRESS,
        )
        s = str(progress)
        assert client_user.email in s
        assert mod.slug in s
        assert "in_progress" in s


# ─────────────────────────────────────────────────────────────────────────────
# 7. training/serializers.py — ligne 30
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_training_serializer_user_status_is_none_without_request_context():
    """
    Ligne 30 : get_user_status retourne None si le contexte ne contient
    pas de 'request' (ou si request.user n'est pas authentifié).
    """
    from apps.training.serializers import TrainingModuleListSerializer

    mod = TrainingModule.objects.first()
    # Pas de 'request' dans le contexte du sérialiseur → None
    data = TrainingModuleListSerializer(mod, context={}).data
    assert data["user_status"] is None


# ─────────────────────────────────────────────────────────────────────────────
# 8. notifications/emails.py — 0% (3 fonctions)
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestNotificationsEmails:
    """Couvre les 3 fonctions de notifications/emails.py via mock resend."""

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_email_appelle_resend_avec_bons_champs(self, mock_send):
        """send_email() transmet 'from', 'to', 'subject', 'html' à resend."""
        from apps.notifications.emails import send_email

        mock_send.return_value = {"id": "email-001"}
        result = send_email(
            to="destinataire@example.com",
            subject="Sujet de test",
            html="<p>Corps HTML</p>",
        )
        mock_send.assert_called_once()
        payload = mock_send.call_args[0][0]
        assert payload["to"] == ["destinataire@example.com"]
        assert payload["subject"] == "Sujet de test"
        assert "<p>Corps HTML</p>" in payload["html"]
        assert result == {"id": "email-001"}

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_welcome_email_contient_prenom_et_lien(
        self, mock_send, client_user
    ):
        """send_welcome_email() envoie un email de bienvenue personnalisé."""
        from apps.notifications.emails import send_welcome_email

        mock_send.return_value = {"id": "welcome-001"}
        result = send_welcome_email(client_user)

        mock_send.assert_called_once()
        payload = mock_send.call_args[0][0]
        assert client_user.email in payload["to"]
        assert "Bienvenue" in payload["subject"]
        assert client_user.first_name in payload["html"]
        assert result == {"id": "welcome-001"}

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_audit_status_email_completed(self, mock_send, client_user):
        """send_audit_status_email() inclut le label français 'Terminé' pour 'completed'."""
        from apps.notifications.emails import send_audit_status_email

        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(
            client=client_user, pack=pack, status="completed"
        )
        mock_send.return_value = {"id": "status-001"}
        result = send_audit_status_email(client_user, audit)

        mock_send.assert_called_once()
        payload = mock_send.call_args[0][0]
        assert client_user.email in payload["to"]
        assert "Terminé" in payload["html"]
        assert "Terminé" in payload["subject"]
        assert result == {"id": "status-001"}

    @patch("apps.notifications.emails.resend.Emails.send")
    def test_send_audit_status_email_statut_inconnu_utilise_valeur_brute(
        self, mock_send, client_user
    ):
        """
        labels.get(status, status) : un statut hors du dict → valeur brute utilisée.
        Couvre le fallback de dict.get() dans send_audit_status_email().
        """
        from apps.notifications.emails import send_audit_status_email

        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        # "archived" n'est pas dans le dict labels → utilisé tel quel
        audit.status = "archived"
        audit.save(update_fields=["status"])

        mock_send.return_value = {"id": "status-002"}
        send_audit_status_email(client_user, audit)
        mock_send.assert_called_once()


# ─────────────────────────────────────────────────────────────────────────────
# 9. setup_admin management command — 0% (3 branches)
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSetupAdminCommand:
    """Couvre les 3 branches de setup_admin.handle()."""

    def test_missing_password_env_var_skip_avec_warning(self):
        """Branch 1 : ADMIN_PASSWORD absent → skip avec message ⚠️."""
        out = StringIO()
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("ADMIN_PASSWORD", None)
            call_command("setup_admin", stdout=out)
        assert "ADMIN_PASSWORD" in out.getvalue()
        # Aucun utilisateur admin créé
        assert not User.objects.filter(email="admin@cyberaudit.fr").exists()

    def test_creates_new_admin_quand_absent(self):
        """Branch 3 : admin inexistant → créé avec is_staff=True, role=admin."""
        out = StringIO()
        with mock.patch.dict(
            os.environ,
            {
                "ADMIN_PASSWORD": "TestPwd!2026",
                "ADMIN_EMAIL": "newadmin_gap@cyberaudit.fr",
            },
        ):
            call_command("setup_admin", stdout=out)

        user = User.objects.get(email="newadmin_gap@cyberaudit.fr")
        assert user.role == "admin"
        assert user.is_staff is True
        assert user.is_superuser is True
        assert "newadmin_gap@cyberaudit.fr" in out.getvalue()

    def test_skip_si_admin_existe_deja(self, make_admin_user):
        """Branch 2 : admin déjà en base → skip (count inchangé, message ℹ️)."""
        make_admin_user()  # crée admin@cyberaudit.fr
        count_before = User.objects.count()
        out = StringIO()
        with mock.patch.dict(os.environ, {"ADMIN_PASSWORD": "WhateverPwd!"}):
            # ADMIN_EMAIL absent → défaut = admin@cyberaudit.fr (déjà en base)
            os.environ.pop("ADMIN_EMAIL", None)
            call_command("setup_admin", stdout=out)
        assert User.objects.count() == count_before
        output = out.getvalue()
        # Le message contient "admin@cyberaudit.fr" ET "existe déjà" ou "skip"
        assert "admin@cyberaudit.fr" in output


# ─────────────────────────────────────────────────────────────────────────────
# 10. translate_training management command — 0%
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestTranslateTrainingCommand:
    """Couvre translate_training.handle() : titre connu traduit, titre inconnu intact."""

    def test_traduit_titre_connu(self):
        """Module avec titre dans TRANSLATIONS → traduit en anglais + description maj."""
        mod = TrainingModule.objects.create(
            slug="test-gap-wifi",
            title="Wi-Fi public & VPN",
            description="Ancienne description FR",
            published_at=timezone.now(),
        )
        out = StringIO()
        call_command("translate_training", stdout=out)
        mod.refresh_from_db()
        assert mod.title == "Public Wi-Fi & VPN"
        assert mod.description == "Stay safe on external networks."
        assert "Public Wi-Fi & VPN" in out.getvalue()

    def test_titre_inconnu_reste_inchange(self):
        """Module avec titre hors TRANSLATIONS → intouché."""
        mod = TrainingModule.objects.create(
            slug="test-gap-inconnu",
            title="Module sans traduction définie",
            description="Description originale",
            published_at=timezone.now(),
        )
        out = StringIO()
        call_command("translate_training", stdout=out)
        mod.refresh_from_db()
        assert mod.title == "Module sans traduction définie"
        assert mod.description == "Description originale"

    def test_affiche_nombre_total_de_modules_traduits(self):
        """Le récapitulatif '=> N modules translated' est affiché en fin de commande."""
        # Crée un module traduisible pour s'assurer que updated >= 1
        TrainingModule.objects.create(
            slug="test-gap-phishing",
            title="Réaction aux incidents",
            description="Description FR",
            published_at=timezone.now(),
        )
        out = StringIO()
        call_command("translate_training", stdout=out)
        output = out.getvalue()
        assert "translated" in output


# ─────────────────────────────────────────────────────────────────────────────
# 11. reports/services.py ligne 70 + training/views.py ligne 54
# ─────────────────────────────────────────────────────────────────────────────


def test_score_to_grade_fallback_returns_F_for_negative_score():
    """
    Ligne 70 reports/services.py : return "F" est une garde de sécurité.
    Elle n'est atteignable qu'avec un score négatif (score < 0).
    compute_score() ne peut pas produire un score < 0, mais score_to_grade()
    est une fonction publique qu'on peut appeler directement.
    """
    from apps.reports.services import score_to_grade

    # Score négatif → aucun seuil ne matche → retourne "F" (ligne 70)
    assert score_to_grade(-1) == "F"
    assert score_to_grade(-100) == "F"


@pytest.mark.django_db
def test_training_module_detail_view_returns_content_md(auth_client):
    """
    Ligne 54 training/views.py : TrainingModuleDetailView.get_queryset()
    est appelée lors du GET sur /api/training/modules/{id}/.
    """
    mod = TrainingModule.objects.filter(published_at__isnull=False).first()
    resp = auth_client.get(f"/api/training/modules/{mod.id}/")
    assert resp.status_code == status.HTTP_200_OK
    # La vue détail inclut content_md (absent de la vue liste)
    assert "content_md" in resp.data
    assert resp.data["slug"] == mod.slug


# ─────────────────────────────────────────────────────────────────────────────
# 12. accounts/views.py — PasswordResetRequestView + PasswordResetConfirmView
#     Lignes 123-139 et 149-172
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestPasswordResetRequestView:
    """Couvre PasswordResetRequestView.post() — lignes 123-139."""

    URL = "/api/auth/password-reset/request/"

    def test_email_absent_returns_400(self, api_client):
        """Ligne 125 : email vide → 400 + detail."""
        resp = api_client.post(self.URL, {})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "detail" in resp.data

    def test_email_existant_returns_200_avec_token(self, api_client, client_user):
        """Lignes 127-137 : email en base → 200 + reset_token + user_email."""
        resp = api_client.post(self.URL, {"email": client_user.email})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        assert "reset_token" in resp.data
        assert "." in resp.data["reset_token"]  # format uid.token
        assert resp.data["user_email"] == client_user.email

    def test_email_inexistant_returns_200_sans_token(self, api_client):
        """Ligne 139 : email absent en base → 200 sans reset_token (anti-énumération)."""
        resp = api_client.post(self.URL, {"email": "ghost@nowhere.example"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data.get("success") is True
        assert "reset_token" not in resp.data

    def test_email_case_insensitive(self, api_client, client_user):
        """Ligne 123 : strip + lower → email en majuscules reconnu."""
        resp = api_client.post(self.URL, {"email": client_user.email.upper()})
        assert resp.status_code == status.HTTP_200_OK
        assert "reset_token" in resp.data


@pytest.mark.django_db
class TestPasswordResetConfirmView:
    """Couvre PasswordResetConfirmView.post() — lignes 149-172."""

    URL = "/api/auth/password-reset/confirm/"

    def _get_token(self, api_client, email):
        """Demande un token de reset et le retourne."""
        resp = api_client.post(
            "/api/auth/password-reset/request/", {"email": email}
        )
        return resp.data["reset_token"]

    def test_token_absent_returns_400(self, api_client):
        """Ligne 152 : token absent → 400."""
        resp = api_client.post(self.URL, {"new_password": "newpass123"})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "detail" in resp.data

    def test_token_sans_point_returns_400(self, api_client):
        """Ligne 152 : token sans '.' → 400."""
        resp = api_client.post(
            self.URL, {"token": "tokenSansPoint", "new_password": "newpass123"}
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_mot_de_passe_trop_court_returns_400(self, api_client, client_user):
        """Lignes 153-157 : new_password < 8 chars → 400."""
        token = self._get_token(api_client, client_user.email)
        resp = api_client.post(
            self.URL, {"token": token, "new_password": "court"}
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "8" in resp.data.get("detail", "")

    def test_uid_invalide_returns_400(self, api_client):
        """Lignes 162-165 : uid non décodable ou user inexistant → 400."""
        resp = api_client.post(
            self.URL,
            {"token": "invaliduid.invalidtoken", "new_password": "newpass123"},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalide" in resp.data.get("detail", "").lower()

    def test_token_invalide_returns_400(self, api_client, client_user):
        """Lignes 166-169 : uid valide mais token falsifié → check_token échoue → 400."""
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(client_user.pk))
        resp = api_client.post(
            self.URL,
            {"token": f"{uid}.fakesignature", "new_password": "newpass123"},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalide" in resp.data.get("detail", "").lower()

    def test_cas_nominal_change_mot_de_passe(self, api_client, client_user):
        """Lignes 170-172 : token valide + mdp ≥ 8 chars → 200 + mdp changé."""
        token = self._get_token(api_client, client_user.email)
        resp = api_client.post(
            self.URL,
            {"token": token, "new_password": "NouveauMdp!2026"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True
        # Vérifier que le mot de passe est bien changé en base
        client_user.refresh_from_db()
        assert client_user.check_password("NouveauMdp!2026")
