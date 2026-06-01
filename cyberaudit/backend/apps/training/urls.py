"""training/urls.py — Routes /api/training/."""

from django.urls import path

from .views import (
    CompleteModuleView,
    StartModuleView,
    TrainingModuleDetailView,
    TrainingModuleListView,
)

urlpatterns = [
    path("training/modules/", TrainingModuleListView.as_view(), name="training-list"),
    path("training/modules/<int:pk>/", TrainingModuleDetailView.as_view(), name="training-detail"),
    path("training/modules/<int:pk>/start/", StartModuleView.as_view(), name="training-start"),
    path(
        "training/modules/<int:pk>/complete/",
        CompleteModuleView.as_view(),
        name="training-complete",
    ),
]
