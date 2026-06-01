"""audits/urls.py — Routes /api/packs/ et /api/audits/."""

from django.urls import path

from .views import (
    AuditRequestDetailView,
    AuditRequestListCreateView,
    PackDetailView,
    PackListView,
)

urlpatterns = [
    path("packs/", PackListView.as_view(), name="pack-list"),
    path("packs/<int:pk>/", PackDetailView.as_view(), name="pack-detail"),
    path("audits/", AuditRequestListCreateView.as_view(), name="audit-list-create"),
    path("audits/<uuid:pk>/", AuditRequestDetailView.as_view(), name="audit-detail"),
]
