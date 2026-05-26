from django.contrib import admin

from .models import AuditPack, AuditRequest


@admin.register(AuditPack)
class AuditPackAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "duration_days", "price")
    search_fields = ("code", "name")


@admin.register(AuditRequest)
class AuditRequestAdmin(admin.ModelAdmin):
    list_display = ("reference", "client", "pack", "status", "submitted_at")
    list_filter = ("status", "pack")
    search_fields = ("reference", "client__email")
    readonly_fields = ("id", "reference", "submitted_at", "updated_at")
