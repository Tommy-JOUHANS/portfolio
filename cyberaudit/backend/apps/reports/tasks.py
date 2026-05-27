"""
reports/tasks.py — Tâche Celery generate_pdf_task.

Workflow :
  1. Rend le template HTML avec les données du rapport
  2. WeasyPrint convertit le HTML en PDF
  3. Sauvegarde le fichier dans MEDIA_ROOT/reports/
  4. Met à jour le modèle (pdf_path, generated_at)
  5. Crée + envoie une notification "report_ready" au client
"""
from pathlib import Path

from celery import shared_task
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    max_retries=3,
    default_retry_delay=10,
    retry_backoff=True,
    retry_backoff_max=600,
)
def generate_pdf_task(self, report_id):
    """Génère le PDF d'un AuditReport et notifie le client."""
    # Imports locaux (circular import + permet de mocker en test)
    from weasyprint import HTML

    from apps.notifications.models import Notification
    from apps.notifications.services import create_and_send

    from .models import AuditReport

    try:
        report = AuditReport.objects.select_related(
            "audit_request__client", "audit_request__pack"
        ).get(pk=report_id)
    except AuditReport.DoesNotExist:
        return f"AuditReport {report_id} introuvable"

    # 1. Rendu HTML
    html_string = render_to_string(
        "reports/report.html",
        {
            "report": report,
            "audit": report.audit_request,
            "client": report.audit_request.client,
            "pack": report.audit_request.pack,
        },
    )

    # 2. WeasyPrint → PDF
    media_root = Path(settings.MEDIA_ROOT) / "reports"
    media_root.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"{report.audit_request.reference}.pdf"
    pdf_path = media_root / pdf_filename

    HTML(string=html_string).write_pdf(str(pdf_path))

    # 3. Mise à jour du modèle
    report.pdf_path = str(pdf_path)
    report.generated_at = timezone.now()
    report.save(update_fields=["pdf_path", "generated_at"])

    # 4. Notification au client
    create_and_send(
        user=report.audit_request.client,
        request=report.audit_request,
        type_=Notification.Type.REPORT_READY,
        subject=f"Votre rapport d'audit est prêt — {report.audit_request.reference}",
        message=(
            f"Bonjour {report.audit_request.client.first_name},\n\n"
            f"Le rapport de votre audit {report.audit_request.reference} "
            f"est maintenant disponible (Grade {report.grade}, "
            f"Score {report.security_score}/100).\n\n"
            "Vous pouvez le télécharger depuis votre tableau de bord.\n\n"
            "L'équipe CyberAudit & Solutions."
        ),
    )

    return f"PDF généré : {pdf_path}"
