"""reports/serializers.py — Sérialiseur lecture pour AuditReport."""
from rest_framework import serializers
from .models import AuditReport


class AuditReportSerializer(serializers.ModelSerializer):
    audit_reference = serializers.CharField(source="audit_request.reference", read_only=True)

    class Meta:
        model = AuditReport
        fields = [
            "id", "audit_reference", "summary", "verdict", "grade",
            "security_score", "findings", "pdf_path", "generated_at",
        ]
        read_only_fields = fields
