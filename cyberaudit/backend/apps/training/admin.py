from django.contrib import admin

from .models import TrainingModule, TrainingProgress


@admin.register(TrainingModule)
class TrainingModuleAdmin(admin.ModelAdmin):
    list_display = ("slug", "title", "level", "duration_min", "published_at")
    list_filter = ("level",)
    search_fields = ("slug", "title")


@admin.register(TrainingProgress)
class TrainingProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "module", "status", "started_at", "completed_at")
    list_filter = ("status",)
    search_fields = ("user__email", "module__slug")
    readonly_fields = ("created_at", "updated_at")
