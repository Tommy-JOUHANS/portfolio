"""
conftest.py — Fixtures pytest partagées par toutes les apps du projet.

Fixtures exposées :
  - api_client          : APIClient DRF anonyme
  - auth_client         : APIClient authentifié comme client (Marie)
  - admin_auth_client   : APIClient authentifié comme admin (Karim)
  - client_user         : utilisateur client par défaut
  - admin_user          : utilisateur admin par défaut
  - make_client_user    : factory pour créer un client avec champs surcouchables
  - make_admin_user     : factory pour créer un admin avec champs surcouchables
"""
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User


# ── Factories ────────────────────────────────────────────────────────────────

@pytest.fixture
def make_client_user(db):
    """Crée un compte client. Les champs passés en kwargs surchargent les défauts."""
    def _make(**overrides):
        defaults = {
            "email": "marie@example.com",
            "password": "Secur1ty!",
            "first_name": "Marie",
            "last_name": "Dupont",
            "company_name": "Cabinet Dijon",
        }
        defaults.update(overrides)
        return User.objects.create_user(**defaults)
    return _make


@pytest.fixture
def make_admin_user(db):
    """Crée un compte admin (role=admin, is_staff=True)."""
    def _make(**overrides):
        defaults = {
            "email": "admin@cyberaudit.fr",
            "password": "Adm1n!Strong",
            "first_name": "Karim",
            "last_name": "Haddad",
            "role": User.Role.ADMIN,
            "is_staff": True,
        }
        defaults.update(overrides)
        return User.objects.create_user(**defaults)
    return _make


# ── Utilisateurs par défaut ──────────────────────────────────────────────────

@pytest.fixture
def client_user(make_client_user):
    """Utilisateur client par défaut (Marie / Cabinet Dijon)."""
    return make_client_user()


@pytest.fixture
def admin_user(make_admin_user):
    """Utilisateur admin par défaut (Karim)."""
    return make_admin_user()


# ── Clients HTTP ─────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    """Client DRF non authentifié."""
    return APIClient()


@pytest.fixture
def auth_client(api_client, client_user):
    """Client DRF authentifié comme un client standard."""
    token = RefreshToken.for_user(client_user).access_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client


@pytest.fixture
def admin_auth_client(api_client, admin_user):
    """Client DRF authentifié comme un admin."""
    token = RefreshToken.for_user(admin_user).access_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client
