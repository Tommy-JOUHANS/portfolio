from django.contrib import admin

from .models import AuditReport


@admin.register(AuditReport)
class AuditReportAdmin(admin.ModelAdmin):
    list_display = ("audit_request", "grade", "security_score", "generated_at")
    list_filter = ("grade",)
    search_fields = ("audit_request__reference",)
    readonly_fields = ("id", "created_at", "updated_at", "pdf_path", "generated_at")
