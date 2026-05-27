"""
config/urls.py — Routage principal du projet CyberAudit.

  /api/auth/   → apps.accounts.urls
  /admin/      → Django admin (dev uniquement)
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/",    admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/",      include("apps.audits.urls")),
    path("api/",      include("apps.notifications.urls")),
    path("api/",      include("apps.reports.urls")),

]
