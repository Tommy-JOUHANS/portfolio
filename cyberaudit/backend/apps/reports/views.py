"""
reports/views.py — Endpoints PDF.
  POST /api/audits/{id}/generate-report/  admin → score recalculé serveur-side, déclenche Celery
  GET  /api/audits/{id}/report/           owner/admin → streame le PDF
  GET  /api/audits/{id}/report/data/      owner/admin → JSON du rapport
"""
from django.http import FileResponse, Http404
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audits.models import AuditRequest
from .models import AuditReport
from .services import sanitize_findings, compute_score_and_grade
from .tasks import generate_pdf_task


def _get_audit_or_404(audit_id):
    try:
        return AuditRequest.objects.get(pk=audit_id)
    except AuditRequest.DoesNotExist:
        raise Http404


class GenerateReportView(APIView):
    """POST /api/audits/{id}/generate-report/ — Admin uniquement.

    SÉCURITÉ : security_score et grade envoyés par le client sont IGNORÉS.
    On les recalcule depuis les findings (anti-tampering).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, audit_id):
        if request.user.role != "admin":
            raise PermissionDenied("Seul un administrateur peut générer un rapport.")

        audit = _get_audit_or_404(audit_id)

        # 1. Sanitize les findings (filtre champs + normalise sévérité).
        findings = sanitize_findings(request.data.get("findings", []))

        # 2. Calcule score + grade côté serveur (jamais depuis le client).
        security_score, grade = compute_score_and_grade(findings)

        # 3. Upsert : un seul rapport max par demande.
        report, _ = AuditReport.objects.update_or_create(
            audit_request=audit,
            defaults={
                "summary": str(request.data.get("summary", "")).strip(),
                "verdict": str(request.data.get("verdict", "")).strip(),
                "security_score": security_score,
                "grade": grade,
                "findings": findings,
                "pdf_path": "",          # reset → on regénère
                "generated_at": None,
            },
        )

        # 4. Déclenche la génération PDF en async.
        generate_pdf_task.delay(str(report.id))

        return Response(
            {
                "id": str(report.id),
                "status": "generating",
                "security_score": security_score,
                "grade": grade,
                "findings_count": len(findings),
            },
            status=status.HTTP_202_ACCEPTED,
        )


class ReportDownloadView(APIView):
    """GET /api/audits/{id}/report/ — Owner ou admin, streame le PDF."""
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        audit = _get_audit_or_404(audit_id)
        # Anti-énumération : non-owner & non-admin → 404 (pas 403)
        if request.user.role != "admin" and audit.client_id != request.user.id:
            raise Http404
        try:
            report = audit.report
        except AuditReport.DoesNotExist:
            raise NotFound("Aucun rapport pour cette demande.")
        if not report.pdf_path:
            return Response(
                {"detail": "PDF en cours de génération."},
                status=status.HTTP_202_ACCEPTED,
            )
        try:
            f = open(report.pdf_path, "rb")
        except FileNotFoundError:
            raise NotFound("Fichier PDF introuvable sur disque.")
        response = FileResponse(f, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{audit.reference}.pdf"'
        response["Cache-Control"] = "no-store, private"
        return response


class ReportDataView(APIView):
    """GET /api/audits/{id}/report/data/ — JSON du rapport (owner ou admin)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, audit_id):
        audit = _get_audit_or_404(audit_id)
        if request.user.role != "admin" and audit.client_id != request.user.id:
            raise Http404
        try:
            report = audit.report
        except AuditReport.DoesNotExist:
            raise NotFound("Aucun rapport pour cette demande.")
        from .serializers import AuditReportSerializer
        return Response(AuditReportSerializer(report).data)
