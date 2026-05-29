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

from rest_framework import serializers
from .models import AuditReport

class AuditReportSerializer(serializers.ModelSerializer):
    audit_reference = serializers.SerializerMethodField()

    class Meta:
        model = AuditReport
        fields = [
            "id", "audit_reference", "grade", "security_score",
            "verdict", "summary", "findings", "generated_at",
        ]
        read_only_fields = fields

    def get_audit_reference(self, obj):
        return obj.audit_request.reference
