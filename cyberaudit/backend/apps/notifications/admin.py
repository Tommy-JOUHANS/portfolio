from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("type", "user", "subject", "status", "sent_at", "created_at")
    list_filter = ("type", "status")
    search_fields = ("subject", "user__email")
    readonly_fields = ("id", "created_at", "sent_at")
