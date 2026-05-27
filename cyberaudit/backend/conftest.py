<<<<<<< HEAD
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

=======
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
>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User


<<<<<<< HEAD
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
=======
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
>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
    return make_client_user()


@pytest.fixture
def admin_user(make_admin_user):
<<<<<<< HEAD
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
=======
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


@pytest.fixture(autouse=True)
def _reset_throttle_cache():
    """Reset les compteurs de throttle DRF entre chaque test."""
    from django.core.cache import cache
    cache.clear()
    yield
    cache.clear()
    

@pytest.fixture(autouse=True)
def _celery_eager_and_locmem_email(settings):
    """
    En test :
      - Exécute les tâches Celery synchroniquement (pas besoin de worker)
      - Capture les emails en mémoire (mail.outbox) au lieu de SMTP
    """
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
>>>>>>> 08f73c6dc1b9a9b1d4b758745c98861cb41d347c
