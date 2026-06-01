"""
reports/tests.py — Tests AuditReport (modèle, endpoints, tâche Celery).
"""

from unittest.mock import MagicMock, patch

import pytest
from rest_framework import status

from apps.audits.models import AuditPack, AuditRequest
from apps.reports.models import AuditReport
from apps.reports.tasks import generate_pdf_task

# ── Modèle AuditReport ───────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAuditReportModel:
    def test_default_grade_and_score(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        report = AuditReport.objects.create(audit_request=audit)
        assert report.grade == "C"
        assert report.security_score == 50
        assert report.pdf_path == ""

    def test_str_contains_reference_and_grade(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        report = AuditReport.objects.create(audit_request=audit, grade="A")
        assert "A" in str(report)
        assert audit.reference in str(report)


# ── POST /api/audits/{id}/generate-report/ ───────────────────────────────────


@pytest.mark.django_db
class TestGenerateReportEndpoint:
    def _url(self, audit_id):
        return f"/api/audits/{audit_id}/generate-report/"

    @patch("apps.reports.views.generate_pdf_task.delay")
    def test_admin_can_trigger(self, mock_delay, admin_auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = admin_auth_client.post(
            self._url(audit.id),
            {
                "summary": "Tout va bien",
                "security_score": 80,
                "grade": "B+",
                "findings": [],
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_202_ACCEPTED
        assert AuditReport.objects.filter(audit_request=audit).exists()
        mock_delay.assert_called_once()

    def test_client_cannot_trigger(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = auth_client.post(self._url(audit.id), {}, format="json")
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_returns_401(self, api_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = api_client.post(self._url(audit.id), {}, format="json")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


# ── GET /api/audits/{id}/report/ ─────────────────────────────────────────────


@pytest.mark.django_db
class TestReportDownloadEndpoint:
    def _url(self, audit_id):
        return f"/api/audits/{audit_id}/report/"

    def test_owner_can_download(self, auth_client, client_user, tmp_path):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        pdf_file = tmp_path / "test.pdf"
        pdf_file.write_bytes(b"%PDF-1.4 fake")
        AuditReport.objects.create(audit_request=audit, pdf_path=str(pdf_file))
        resp = auth_client.get(self._url(audit.id))
        assert resp.status_code == status.HTTP_200_OK
        assert resp["Content-Type"] == "application/pdf"
        assert resp["Cache-Control"] == "no-store, private"

    def test_other_client_gets_404(self, api_client, make_client_user, tmp_path):
        from rest_framework_simplejwt.tokens import RefreshToken

        client_a = make_client_user(email="a@example.com")
        client_b = make_client_user(email="b@example.com")
        pack = AuditPack.objects.get(code="audit")
        audit_a = AuditRequest.objects.create(client=client_a, pack=pack)
        pdf_file = tmp_path / "x.pdf"
        pdf_file.write_bytes(b"x")
        AuditReport.objects.create(audit_request=audit_a, pdf_path=str(pdf_file))
        token = RefreshToken.for_user(client_b).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = api_client.get(self._url(audit_a.id))
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_pdf_not_generated_returns_202(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        AuditReport.objects.create(audit_request=audit)  # pdf_path vide
        resp = auth_client.get(self._url(audit.id))
        assert resp.status_code == status.HTTP_202_ACCEPTED

    def test_no_report_at_all_returns_404(self, auth_client, client_user):
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        resp = auth_client.get(self._url(audit.id))
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ── Tâche Celery generate_pdf_task ───────────────────────────────────────────


@pytest.mark.django_db
class TestGeneratePdfTask:
    @patch("weasyprint.HTML")
    def test_task_creates_pdf_and_notifies(
        self,
        mock_html,
        client_user,
        settings,
        tmp_path,
    ):
        settings.MEDIA_ROOT = str(tmp_path)
        pack = AuditPack.objects.get(code="audit")
        audit = AuditRequest.objects.create(client=client_user, pack=pack)
        report = AuditReport.objects.create(audit_request=audit, grade="A", security_score=92)
        mock_html.return_value.write_pdf = MagicMock()

        generate_pdf_task(str(report.id))

        report.refresh_from_db()
        assert report.pdf_path != ""
        assert report.generated_at is not None

        from apps.notifications.models import Notification

        notif = Notification.objects.filter(
            user=client_user,
            type="report_ready",
        ).first()
        assert notif is not None
        assert audit.reference in notif.subject

    def test_task_returns_message_if_report_missing(self):
        result = generate_pdf_task("00000000-0000-0000-0000-000000000000")
        assert "introuvable" in result
