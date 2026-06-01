"""reports/urls.py — Routes nested sous /api/audits/{id}/."""

from django.urls import path

from .views import GenerateReportView, ReportDataView, ReportDownloadView

urlpatterns = [
    path(
        "audits/<uuid:audit_id>/generate-report/",
        GenerateReportView.as_view(),
        name="report-generate",
    ),
    path(
        "audits/<uuid:audit_id>/report/",
        ReportDownloadView.as_view(),
        name="report-download",
    ),
    path(
        "audits/<uuid:audit_id>/report/data/",
        ReportDataView.as_view(),
        name="report-data",
    ),
]
