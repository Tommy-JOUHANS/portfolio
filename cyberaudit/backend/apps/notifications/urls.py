"""notifications/urls.py — Routes /api/notifications/."""

from django.urls import path

from .views import NotificationListView

urlpatterns = [
    path("notifications/me/", NotificationListView.as_view(), name="notification-list-me"),
]
