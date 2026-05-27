# ========================================================================
# conftest.py — Fixtures pytest partagées entre toutes les apps.
#
# Disponibles dans tous les tests sans import :
#   api_client      → APIClient anonyme
#   client_user     → utilisateur client marie@example.com (singleton)
#   make_client_user → factory pour créer des clients à la volée
#   make_admin_user  → factory pour créer des admins à la volée
#   auth_client      → APIClient authentifié avec client_user
# ========================================================================

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_user(email, role=User.Role.CLIENT, is_staff=False, **kwargs):
    defaults = dict(
        first_name="Marie",
        last_name="Dupont",
        company_name="Test SARL",
        password="Secur1ty!",
    )
    defaults.update(kwargs)
    password = defaults.pop("password")
    user = User.objects.create_user(email=email, role=role, is_staff=is_staff, **defaults)
    user.set_password(password)
    user.save(update_fields=["password"])
    return user


def _auth_client_for(user):
    """Retourne un APIClient avec le JWT de l'utilisateur."""
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    """Client REST anonyme."""
    return APIClient()


@pytest.fixture
def make_client_user():
    """Factory : crée un utilisateur client avec les paramètres souhaités."""
    def _factory(email="marie@example.com", **kwargs):
        return _make_user(email, role=User.Role.CLIENT, **kwargs)
    return _factory


@pytest.fixture
def make_admin_user():
    """Factory : crée un administrateur."""
    def _factory(email="admin@example.com", **kwargs):
        return _make_user(email, role=User.Role.ADMIN, is_staff=True, **kwargs)
    return _factory


@pytest.fixture
def client_user(make_client_user):
    """Utilisateur client réutilisable (marie@example.com / Secur1ty!)."""
    return make_client_user()


@pytest.fixture
def admin_user(make_admin_user):
    """Administrateur réutilisable."""
    return make_admin_user()


@pytest.fixture
def auth_client(client_user):
    """APIClient authentifié en tant que client_user."""
    return _auth_client_for(client_user)


@pytest.fixture
def admin_auth_client(admin_user):
    """APIClient authentifié en tant qu'admin."""
    return _auth_client_for(admin_user)
