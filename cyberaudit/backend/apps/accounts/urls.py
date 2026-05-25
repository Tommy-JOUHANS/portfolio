"""
accounts/urls.py — Routes d'authentification.

Préfixe appliqué dans config/urls.py : /api/auth/
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import ChangePasswordView, LoginView, LogoutView, MeView, RegisterView

urlpatterns = [
    # ── Inscription / Connexion ───────────────────────────────────────────────
    path("register/",        RegisterView.as_view(),    name="auth-register"),
    path("login/",           LoginView.as_view(),        name="auth-login"),
    path("logout/",          LogoutView.as_view(),       name="auth-logout"),

    # ── Renouvellement du token (SimpleJWT natif) ─────────────────────────────
    path("token/refresh/",   TokenRefreshView.as_view(), name="token-refresh"),

    # ── Profil courant ────────────────────────────────────────────────────────
    path("me/",              MeView.as_view(),            name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
]
